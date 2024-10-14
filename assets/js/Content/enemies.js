window.Enemies = {
    "enemy_1": {
        name: "Sage",
        src: "/",
        fighters: {
            "a": {
                fighterId: "e001",
                maxHp: 10,
                level: 2,
                items: [
                    { actionId: "item_recoverHp", instanceId: "item1" },
                ],
            }
        }
    },
    "boss_1": {
        name: "RedBoss",
        src: "/",
        fighters: {
            "a": {
                fighterId: "b001",
                maxHp: 100,
                level: 9,
            }
        }
    }
}