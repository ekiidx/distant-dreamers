window.Actions = {
    strike: {
        name: "Strike",
        description: "Hit the enemy.",
        sound: "strike1",
        success: [
            { type: "textMessage", text: "{CASTER} uses {ACTION}!" },
            { type: "animation", animation: "spin"},
            { type: "stateChange", damage: 10 }

        ]
    },
    regen: {
        name: "Regen",
        description: "Restore 10 HP for 3 rounds.",
        targetType: "friendly",
        sound: "regen",
        success: [
            { type: "textMessage", text: "{CASTER} uses {ACTION}!" },
            { type: "stateChange", status: { type: "regen", expiresIn: 3 } }

        ]
    },
    fear: {
        name: "Fear",
        description: "1/3 chance enemy scared stiff for 3 rounds.",
        sound: "fear",
        success: [
            { type: "textMessage", text: "{CASTER} uses {ACTION}!" },
            { type: "animation", animation: "glob", color: "#dddddd" },
            { type: "stateChange", status: { type: "fear", expiresIn: 3 } },
            { type: "textMessage", text: "{TARGET} is afraid!" }
        ]
    },
    // Items
    item_recoverStatus: {
        name: "Remedy",
        description: "Remove all status.",
        targetType: "friendly",
        sound: "regen",
        success: [
            { type: "textMessage", text: "{CASTER} uses a {ACTION}!" },
            { type: "stateChange", status: null },
        ]
    },
    item_recoverHp: {
        name: "Potion",
        description: "Heal 30 HP.",
        targetType: "friendly",
        sound: "regen",
        success: [
            { type: "textMessage", text: "{CASTER} uses a {ACTION}!" },
            { type: "stateChange", recover: 30 },
        ]
    },
}