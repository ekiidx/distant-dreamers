window.BattleAnimations = {
    async spin(event, onComplete) {
      const element = event.caster.fighterElement;
      const animationClassName = event.caster.team === "player" ? "battle-spin-right" : "battle-spin-left";
      element.classList.add(animationClassName);
  
      //Remove class when animation is fully complete
      element.addEventListener("animationend", () => {
        element.classList.remove(animationClassName);
      }, { once:true });
  
      //Continue battle cycle
      await utils.wait(100);
      onComplete();
    }
  }