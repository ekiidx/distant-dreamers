class PlayerState {
    constructor() {
        this.fighters = {
            "p1": {
                fighterId: "p01",
                hp: 50,
                maxHp: 50,
                xp: 90,
                maxXp: 100,
                level: 1,
                // status: { type: "regen" },
                status: null
            },
            // "p2": {
            //     fighterId: "e001",
            //     hp: 50,
            //     maxHp: 50,
            //     xp: 75,
            //     maxXp: 100,
            //     level: 1,
            //     status: null,
            // }
        }
        this.lineup = ["p1"]
        this.items = [
            { actionId: "item_recoverHp", instanceId: "item1" },
            { actionId: "item_recoverHp", instanceId: "item2" },
            { actionId: "item_recoverHp", instanceId: "item3" },
        ]
    }
}
window.playerState = new PlayerState()