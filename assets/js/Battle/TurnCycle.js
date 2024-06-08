class TurnCycle {
    constructor({ battle, onNewEvent, onWinner }) {
      this.battle = battle
      this.onNewEvent = onNewEvent
      this.onWinner = onWinner
      this.currentTeam = "player" //or "enemy"
    }
  
    async turn() {
      //Get the caster
      const casterId = this.battle.activeCombatants[this.currentTeam];
      const caster = this.battle.combatants[casterId]
      const enemyId = this.battle.activeCombatants[caster.team === "player" ? "enemy" : "player"]
      const enemy = this.battle.combatants[enemyId]
  
      const submission = await this.onNewEvent({
        type: "battleMenu",
        caster,
        enemy
      })

      if (submission.instanceId) {

        // Add to list to persist player state later
        this.battle.usedInstanceIds[submission.instanceId] = true
        // Remove item from battle state
        this.battle.items = this.battle.items.filter(i => i.instanceId !== submission.instanceId)
      }

      const resultingEvents = caster.getReplacedEvents(submission.action.success)

      for (let i=0; i<resultingEvents.length; i++) {
        const event = {
          ...resultingEvents[i],
          submission,
          action: submission.action,
          caster,
          target: submission.target,
        }
        await this.onNewEvent(event)
      }

      // Did the target die?
      const targetDead = submission.target.hp <= 0
      if (targetDead) {
        await this.onNewEvent({
          type: "textMessage", text: `${submission.target.name} is defeated!`
        })

        if (submission.target.team === "enemy") {

          const playerActiveId = this.battle.activeCombatants.player
          const xp = submission.target.givesXp

          await this.onNewEvent({
            type: "textMessage",
            text: `Gained ${xp} XP!`
          })

          await this.onNewEvent({
            type: "giveXp",
            xp,
            combatant:  this.battle.combatants[playerActiveId]
          })
        }
      }

      // Do we having a winning team?
      const winner = this.getWinningTeam()
      if (winner) {
        await this.onNewEvent({
          type: "textMessage",
          text: "Winner!"
        })
        // End Battle
        this.onWinner(winner)
        return
      }

      // We have dead player, but still no winner

      // Check for post events
      // do things after the original turn submission
      const postEvents = caster.getPostEvents()
      for (let i=0; i<postEvents.length; i++) {
        const event = {
          ...postEvents[i],
          submission,
          action: submission.action,
          caster,
          target: submission.target
        }
        await this.onNewEvent(event)
      }

      // Check for status expire
      const expiredEvent = caster.decrementStatus()
      if (expiredEvent) {
        await this.onNewEvent(expiredEvent)
      }
  
      this.currentTeam = this.currentTeam === "player" ? "enemy" : "player"
      this.turn();
  
    }

    getWinningTeam() {
      let aliveTeams = {}
      Object.values(this.battle.combatants).forEach(c => {
        if (c.hp > 0) {
          aliveTeams[c.team] = true
        }
      })
      if (!aliveTeams["player"]) { return "enemy"}
      if (!aliveTeams["enemy"]) { return "player"}
      return null
    }
  
    async init() {
      await this.onNewEvent({
        type: "textMessage",
        text: `${this.battle.enemy.name} wants to battle!`
      })
  
      //Start the first turn!
      this.turn()
  
    }
  }