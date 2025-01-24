Module.register("MMM-ChinesePoetry", {

    // Module config defaults.
    defaults: {
        updateInterval: 60000,
        fadeSpeed: 4000,
        url: "https://v1.jinrishici.com/all.json",
        authorAlign: "align-right",
        words: [{
            content: "阿香秋梦起娇啼，玉女传幽素。",
            origin: "烛影摇红·越上霖雨应祷",
            author: "吴文英",
            category: "古诗文-人物-女子"
        }],
        maxQuantity: 20,
        lineBreak: false
    },

    // Define start sequence.
    start: function () {
        Log.info("Starting module: " + this.name);
        this.lastWord = "";
        var self = this;

        // Schedule update timer.
        setInterval(function () {
            self.getJson();
        }, this.config.updateInterval);

    },

    socketNotificationReceived: function (notification, payload) {
        if (notification === "getJson_r") {
            try {
                var thisJson = JSON.parse(payload);
                // 检查返回的JSON对象是否符合预期结构
                if (thisJson && thisJson.content && thisJson.author && thisJson.origin) {
                    // 检查是否已达到最大数量，并移除最早的条目（如果需要）
                    if (this.config.words.length >= this.config.maxQuantity) {
                        this.config.words.shift();
                    }

                    // 检查新条目是否已存在于列表中
                    var exists = this.config.words.some(word => word.content === thisJson.content && word.author === thisJson.author && word.origin === thisJson.origin);
                    if (!exists) {
                        this.config.words.push(thisJson);
                        this.updateDom(this.config.fadeSpeed);
                    }
                } else {
                    Log.error(`Received invalid JSON: ${payload}`);
                }
            } catch (e) {
                Log.error(`Error parsing JSON: ${e.message}`);
            }
        }
    },


    getJson: function () {
        this.sendSocketNotification("getJson_s", this.config.url)
    },

    getRandom: function () {
        words = this.config.words;
        word = words[Math.floor(Math.random() * words.length)];
        while (word.content == this.lastWord) {
            word = words[Math.floor(Math.random() * words.length)]
        }
        this.lastWord = word.content;
        return word;
    },

    // Override dom generator.
    getDom: function () {
        var wrapper = document.createElement("div");
        let { content, origin, author, category } = this.getRandom();
        this.getJson();
        var spw = document.createElement("div");
        spw.className = "thin medium bright pre-line";
        if (this.config.lineBreak) {
            if (content.indexOf("\n") == -1) {
                content = content.replace(/([，。？！])/g, "$1\n");
            }
            content = content.replace(/(\n+)/g, "\n").replace(/(\n$)/, "");
        }
        var parts = content.split("\n");
        for (part of parts) {
            spw.appendChild(document.createTextNode(part));
            spw.appendChild(document.createElement("BR"));
        }
        wrapper.appendChild(spw);
        var spa = document.createElement("div");
        spa.className = this.config.authorAlign ? "small " + this.config.authorAlign : "small";
        spa.appendChild(document.createTextNode(author + "——《" + origin + "》"));
        wrapper.appendChild(spa);
        return wrapper;
    },
});
