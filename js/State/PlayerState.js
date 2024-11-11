class PlayerState {
    constructor() {
        this.fighters = {
            "p1": {
                fighterId: "p01",
                hp: 1,
                maxHp: 50,
                xp: 90,
                maxXp: 100,
                level: 1,
                strength: 2,
                defense: 2,
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
        this.lineup = ["p1"];
        this.items = [
            { actionId: "item_recoverHp", instanceId: "item1" },
            { actionId: "item_recoverHp", instanceId: "item2" },
            { actionId: "item_recoverHp", instanceId: "item3" },
        ]
        this.storyFlags = {
            // "DID_SOMETHING": true,
            // "DEAFEATED_FIRST_BOSS": true,
            // TEST_EVENT: true,
            // USED_CHEST: true
        };
    }

    // swapLineup(oldId, incomingId) {
    //     const oldIndex = this.lineup.indexOf(oldId);
    //     this.lineup[oldIndex] = incomingId;
    //     utils.emitEvent("LineupChanged");
    // }

    // moveToFront(futureFrontId) {
    //     this.lineup = this.lineup.filter(id => id !== futureFrontId);
    //     this.lineup.unshift(futureFrontId);
    //     utils.emitEvent("LineupChanged");
    // }
}
window.playerState = new PlayerState();