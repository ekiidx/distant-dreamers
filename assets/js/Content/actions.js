window.Actions = {
    strike: {
        name: "Attack",
        success: [
            { type: "textMessage", text: "{CASTER} uses {ACTION}!" },
            { type: "animation", animation: "spin"},
            { type: "stateChange", damage: 10 }

        ]
    }
}