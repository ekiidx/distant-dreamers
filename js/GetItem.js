class GetItem {
    constructor({ item, onComplete }) {
        this.item = item;
        this.onComplete = onComplete;
    }

    done() {
        this.onComplete();
    }

    init() {
        console.log(this.item);
        window.playerState.items.push(this.item);
   
        this.done();
    }
}