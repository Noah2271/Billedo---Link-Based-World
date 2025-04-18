class Engine {

    static load(...args) {
        window.onload = () => new Engine(...args);
    }

    constructor(firstSceneClass, storyDataUrl) {
        this.sceneHistory = [];                                             // history stack
        this.inventorySpace = ["EMPTY"];                                    // inventory list
        this.firstSceneClass = firstSceneClass;
        this.storyDataUrl = storyDataUrl;
        this.currentAudio = null;                                           // audio initialization

        this.header = document.body.appendChild(document.createElement("h1"));
        this.output = document.body.appendChild(document.createElement("div"));
        this.actionsContainer = document.body.appendChild(document.createElement("div"));

        fetch(storyDataUrl).then(
            (response) => response.json()
        ).then(
            (json) => {
                this.storyData = json;
                this.gotoScene(firstSceneClass)
            }
        );
    }
    gotoScene(sceneClass, data, skipHistory = false) {                      // modified for scene history stack
        if (!skipHistory && this.scene && this.scene.key !== undefined){    // if scene is not returned from, scene exists, and has a key
            this.sceneHistory.push(this.scene.key);                         // push scene name onto the array / stack
        }
        this.scene = new sceneClass(this);                                  // normal scene method
        this.scene.data = data;
        this.scene.create(data);
    }

    addChoice(action, data) {
        let button = this.actionsContainer.appendChild(document.createElement("button"));
        button.innerText = action;
        button.onclick = () => {
            while(this.actionsContainer.firstChild) {
                this.actionsContainer.removeChild(this.actionsContainer.firstChild)
            }
            this.scene.handleChoice(data);
        }
    }

    setTitle(title) {
        document.title = title;
        this.header.innerText = title;
    }

    show(msg) {
        let div = document.createElement("div");
        div.innerHTML = msg;
        this.output.appendChild(div);
    }
}

class Scene {
    constructor(engine) {
        this.engine = engine;
    }

    create() { }

    update() { }

    handleChoice(action) {
        console.warn('no choice handler on scene ', this);
    }
}