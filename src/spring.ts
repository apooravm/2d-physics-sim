import p5 from "p5";
import type { Particle } from "./particle";

export class Spring {
    k: number;
    restLength: number;
    a: Particle;
    b: Particle;

    constructor(k: number, restLength: number, a: Particle, b: Particle) {
        this.k = k;
        this.restLength = restLength;
        this.a = a;
        this.b = b;
    }

    // F = -K * x
    // x -> extension/displacement
    // K = spring constant -> stiffness/...
    update() {
        let force = this.b.pos.clone().sub(this.a.pos);
        let x = force.mag() - this.restLength;

        force.normalize();
        force.mult_scaler(this.k * x);

        this.a.addForce(force.x, force.y);
        force.mult_scaler(-1);
        this.b.addForce(force.x, force.y);
    }

    show(p: p5) {
        p.strokeWeight(4);
        p.stroke(255);
        p.line(this.a.pos.x, this.a.pos.y, this.b.pos.x, this.b.pos.y);
    }
}
