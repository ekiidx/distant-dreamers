window.Actions = {
    strike: {
        name: "Attack",
        success: [
            { type: "textMessage", text: "{CASTER} uses {ACTION}!" },
            { type: "animation", animation: "spin"},
            { type: "stateChange", damage: 10 }

        ]
    },
    regen: {
        name: "Regen",
        targetType: "friendly",
        success: [
            { type: "textMessage", text: "{CASTER} uses {ACTION}!" },
            { type: "stateChange", status: { type: "regen", expiresIn: 3 } }

        ]
    },
    fear: {
        name: "Fear",
        success: [
            { type: "textMessage", text: "{CASTER} uses {ACTION}!" },
            { type: "animation", animation: "glob", color: "#dddddd" },
            { type: "stateChange", status: { type: "fear", expiresIn: 3 } },
            { type: "textMessage", text: "{TARGET} is afraid!" }
        ]
    }
}