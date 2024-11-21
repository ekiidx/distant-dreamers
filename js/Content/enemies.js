window.Enemies = {
    "enemy_1": {
        name: "Sage",
        src: "/",
        fighters: {
            "a": {
                fighterId: "e001",
                maxHp: 100,
                level: 2,
                strength: 3,
                defense: 1,
                items: [
                    { actionId: "item_recoverHp", instanceId: "item99" },
                ],
                weapon: [
                    { weaponId: "dagger", instanceId: "weapon3" }
                ]
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
                level: 3,
                strength: 3,
                defense: 3,
                weapon: [
                    { weaponId: "short_sword", instanceId: "weapon99" }
                ]
            }
        }
    }
}