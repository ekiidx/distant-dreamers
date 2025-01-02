class BattleMenu {
    constructor({
        caster,
        enemy,
        onComplete,
        items
    }) {
        this.caster = caster;
        this.enemy = enemy;
        this.onComplete = onComplete;

        let quantityMap = {};
        items.forEach(item => {
            if (item.team === caster.team) {

                let existing = quantityMap[item.actionId];
                if (existing) {
                    existing.quantity += 1;
                } else {
                    quantityMap[item.actionId] = {
                        actionId: item.actionId,
                        quantity: 1,
                        instanceId: item.instanceId,
                    }
                }
            }
        })
        this.items = Object.values(quantityMap);
    }

    getScreens() {
        const backOption = {
            label: "Go Back",
            description: "Go back to previous screen.",
            handler: () => {
                this.keyboardMenu.setOptions(this.getScreens().root);
                window.sfx.select.play();
            }
        };

        return {
            root: [{
                    label: "Fight",
                    description: "Choose an attack",
                    handler: () => {
                        // Go to attack
                        this.keyboardMenu.setOptions(this.getScreens().attacks);
                        window.sfx.select.play();
                    }
                },
                {
                    label: "Items",
                    description: "Choose an item",
                    disabled: false,
                    handler: () => {
                        // Go to items
                        this.keyboardMenu.setOptions(this.getScreens().items);
                        window.sfx.select.play();
                    }
                },
            ],
            attacks: [
                ...this.caster.actions.map(key => {
                    const action = Actions[key];
                    return {
                        label: action.name,
                        description: action.description,
                        handler: () => {
                            this.menuSubmit(action);
                            window.sfx.select.play();
                        }
                    }
                }),
                backOption
            ],
            items: [
                ...this.items.map(item => {
                    const action = Actions[item.actionId];
                    return {
                        label: action.name,
                        description: action.description,
                        right: () => {
                            return "x" + item.quantity;
                        },
                        handler: () => {
                            this.menuSubmit(action, item.instanceId);
                            window.sfx.select.play();
                        }
                    }
                }),
                backOption
            ]
        }
    }

    menuSubmit(action, instanceId = null) {
        this.keyboardMenu?.end();
     
        this.onComplete({
            action,
            target: action.targetType === "friendly" ? this.caster : this.enemy,
            instanceId
        })
    }

    decide() {
        this.menuSubmit(Actions[this.caster.actions[0]]);
    }

    showMenu(container) {
        this.keyboardMenu = new KeyboardMenu();
        this.keyboardMenu.init(container);
        this.keyboardMenu.setOptions(this.getScreens().root)
    }

    init(container) {
        if (this.caster.isPlayerControlled) {
            // Show Menu
            this.showMenu(container)
        } else {
            this.decide()
        }
    }
}