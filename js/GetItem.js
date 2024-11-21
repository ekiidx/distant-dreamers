class GetItem {
    constructor({ item, onComplete }) {
        this.item = item;
        this.onComplete = onComplete;
    }

    done() {
        this.onComplete();
    }

    init() {
        window.playerState.items.push(this.item);
        this.done();
    }
}