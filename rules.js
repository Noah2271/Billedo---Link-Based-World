class Start extends Scene {
    create() {
        this.engine.setTitle(this.engine.storyData.Title);
        this.engine.addChoice("BEGIN");
    }

    handleChoice() {
        this.engine.gotoScene(Location, this.engine.storyData.InitialLocation);
    }
}

class Location extends Scene {                                                                                                                                                // normal scene handling
    create(key) {
        this.key = key;
        let locationData = this.engine.storyData.Locations[key];

        if (locationData.Rat && !this.engine.inventorySpace.includes("Inheritance: Jo's Coveted Pokemon Binder")) {                                                           // handle rat and safe conditionals (lock and key item implementation)
            this.engine.show("The rat is now gone.");                                                                                                                         
            this.engine.addChoice("Open the safe.", { Text: "Open the safe.", Target: "SafeNode1", Scene: SafeNode });
            this.engine.addChoice("Return to Hallway.", { Target: "Hallway", Text: "You exit the attic." });                                                                  // if rat handled and safe not open, add choice that sends player to safeNode scene sequence
        } else if (this.engine.inventorySpace.includes("Inheritance: Jo's Coveted Pokemon Binder") && locationData.Rat != undefined) {                                                                         // if binder [key] in inventory, do not let them back into the sequence
            this.engine.show("You stand in the attic now with the inheritance in hand. The attic is no long of use to you. You suppose you could leave the house now.");      
            this.engine.storyData.Locations["Hallway"].GameComplete = true;                                                                                                   // set hallway scene conditional that unlocks the end scene to true [lock and key]
            this.engine.addChoice("Return to Hallway.", { Target: "Hallway", Text: "You exit the attic." });                                                                  // previous could get cluttered in this scene, add a way to directly go back to hallway                  
        } else {
            this.engine.show(locationData.Body);                                                                                                                              // if not a rat scene, handle scene normally                                                                                          
        }

        this.engine.show("------------------");                                                                                                                               // inventory display
        this.engine.show("<b>INVENTORY:</b> " + this.engine.inventorySpace.join(", "));
        this.engine.show("------------------");

        if (locationData.Choices != undefined) {                                                                                                                              // typical scene + item scene handling
            for (let choice of locationData.Choices) {                                                                                                                        // if item for rat in hand, add the option, if item from scene not grabbed, add option to grab it etc.
                if ((!choice.ReqItem || this.engine.inventorySpace.includes(choice.ReqItem)) && (!choice.Item || choice.ItemGrabbed === false) && !locationData.Rat) {
                    this.engine.addChoice(choice.Text, choice);
                }
            }
        }

        if (locationData.GameComplete != undefined && this.engine.storyData.Locations["Hallway"].GameComplete === true) {                                                     // game complete sequence, choice triggers End subclass handling
            this.engine.addChoice("Leave the house.", { Complete: true});
        }

        if (this.engine.sceneHistory.length > 0 && this.engine.storyData.Locations[key].End === undefined) {                                                                  // Go back button / history implementation
            this.engine.addChoice("Previous", { GoBack: true });
        }

        if (this.engine.currentAudio) {                                                                                                                                       // audio implementation [for fun], probably won't work if not on my own computer :(
            this.engine.currentAudio.pause();
            this.engine.currentAudio.currentTime = 0;
            this.engine.currentAudio = null;
        }

        if (locationData.Audio) {
            let sfx = new Audio(locationData.Audio);
            sfx.loop = true;
            sfx.play();
            this.engine.currentAudio = sfx;
        }
    }

    handleChoice(choice) {                                                                                                                                                    // non-safelock handling
        if (choice.Effect === "Mercy" || choice.Effect === "Violence") {                                                                                                      // rat handling
            let locationData = this.engine.storyData.Locations[this.key];
            locationData.Rat = true;                                                                                                                                                                                                                                                                                     // 
            locationData.Audio = null;                                                                                                                                        

            if (choice.Effect === "Mercy") {                                                                                                                                  // remove item from inventory based on item used, also display fun text
                this.engine.inventorySpace = this.engine.inventorySpace.filter(i => i !== "Banana");
                this.engine.show("You hold out the banana. After some hesitation the rat takes a hold of the banana and scurries away. You have chosen the path of mercy, congratulations.");
            } else {
                this.engine.inventorySpace = this.engine.inventorySpace.filter(i => i !== "Rat Spray");
                this.engine.show("Without hesitation you pull the can of rat poison out of your bag and drench the rat. It squeaks as it stumbles backwards dramatically before falling onto its back. The rat has been slain, are you proud?");
            }

            this.engine.gotoScene(Location, "Attic", true);                                                                                                                   // reload attic scene
        
        }else if(choice.Complete == true){                                                                                                                                    // end scene catcher
                this.engine.gotoScene(End);
            
        } else if (choice.GoBack) {                                                                                                                                           // if Go back button, pop previous scene key from stack and load it
            const previousKey = this.engine.sceneHistory.pop();
            if (previousKey) {
                this.engine.gotoScene(Location, previousKey, true);
            } else {
                this.engine.show("You cannot go back any further.");
            }

        } else if (choice && choice.Item === undefined) {                                                                                                                     // normal choice handling
            this.engine.show("&gt; " + choice.Text);
            this.engine.gotoScene(choice.Scene || Location, choice.Target);
                                                                                                                                                                              // item system / inventory handling
        } else if (choice && choice.Item) {                                                                                                                                   // if choose to pick up item, set itemGrabbed to true so it can't be grabbed again. push to engine inventorySpace (inventory implementation)
            this.engine.show("&gt; " + choice.Text);
            this.engine.show(choice.Item + "<span style ='color:green; font-family:Georgia, serif';><b><i> Obtained.</span></b></i>");
            this.engine.inventorySpace = this.engine.inventorySpace.filter(i => i !== "EMPTY");
            this.engine.inventorySpace.push(choice.Item);
            choice.ItemGrabbed = true;
            this.engine.gotoScene(Location, choice.Target);
        }
    }
}

                              
class SafeNode extends Scene {                                                                                                                                               // mechanic subclass for attic safe (mechanic implementation)
    create(key) {
        this.key = key;
        let nodeData = this.engine.storyData.Locations[key];

        this.engine.show(nodeData.Body);

        if (nodeData.Choices) {
            for (let choice of nodeData.Choices) {
                this.engine.addChoice(choice.Text, choice);                                                                                                                 // display all num choices
            }
            this.engine.addChoice("Step away.", {Target: "Attic", Scene: Location });                                                                                       // add option to leave safeNode and back into Location class Attic
        }
    }

    handleChoice(choice) {                                                                                                                                                  // if num choice flagged with false, link back to Safenode1 to simulate resetting lock
        if (choice.Correct === false) {
            this.engine.show("<b>Incorrect, try again.</b>");
            this.engine.gotoScene(SafeNode, "SafeNode1");
        } else if (choice.Final){                                                                                                                                           // if last number input correctly, exit the safeNode subclass instance into Location
            this.engine.show("<b>The safe unlocks with a click.</b>");
            this.engine.storyData.Locations["Attic"].SafeOpen = true;
            this.engine.storyData.Locations["Attic"].Rat = true; 
            this.engine.gotoScene(Location, "SafeNode5");
        } else if (choice.Scene && choice.Target) {                                                                                                                         // implementation for going back to the location subclass attic
            this.engine.gotoScene(choice.Scene, choice.Target);
        } else if (choice.Target) {
            this.engine.gotoScene(SafeNode, choice.Target);                                                                                                                 // if correct num, continue sequence
    }
}
}

class End extends Scene {                                                                                                                                                   // end
    create() {
        this.engine.show("You leave the house with Jo's interesting little collection in your arms. You expected money, but hey-- apparently this thing is worth like 20,000 dollars. You walk off into the sunset. What an interesting guy, your grandpa Jo. <span style='font-size: 1.5rem; color:GoldenRod; font-family:Georgia, serif;'><b><i>[THE END]</span></b></i>");
        this.engine.show("------------------");
        this.engine.show("<b>INVENTORY:</b> " + this.engine.inventorySpace.join(", "));
        this.engine.show("------------------");
        this.engine.show("<hr>");
        this.engine.show(this.engine.storyData.Credits);
    }
}

Engine.load(Start, 'myStory.json');