import p5 from "p5";
import type { Particle } from "./particle";

export class Spring {
    k: number;
    restLength: number;
    a: Particle;
    b: Particle;
    damping: number;
    compliance: number;
    lambda: number;

    constructor(k: number, restLength: number, a: Particle, b: Particle) {
        this.k = k;
        this.restLength = restLength;
        this.a = a;
        this.b = b;
        this.damping = 1;
        this.compliance = 0;
        this.lambda = 0;
    }

    // F = -K * x
    // x -> extension/displacement
    // K = spring constant -> stiffness/...
    update(dt: number) {
        // a- b dir
        let delta = this.b.pos.clone().sub(this.a.pos);
        let dist = delta.mag();

        if (dist <= 0.01) return;

        let dir = delta.clone();
        dir.normalize();

        // spring force
        let x = dist - this.restLength;
        let springForce = dir.clone().mult_scaler(this.k * x);

        // damping force
        let relVel = this.b.vel.clone().sub(this.a.vel);

        // project relvel onto dir
        let velAlongSpring = relVel.dot(dir);

        let dampingForce = dir.clone().mult_scaler(this.damping * velAlongSpring);

        // final force = spring force + damping force
        let force = springForce.clone().add(dampingForce);

        force.mult_scaler(dt);

        this.a.addForce(force.x, force.y);
        this.b.addForce(-force.x, -force.y);
    }

    update2() {
        // spring force
        let delta = this.b.pos.clone().sub(this.a.pos);
        let dist = delta.mag();

        let spring_force = this.k * (dist - this.restLength);

        // damping force
        let dist_norm = delta.div_scaler(dist);
        let v_rel = this.b.vel.clone().sub(this.a.vel);
        let damping_force = dist_norm.dot(v_rel) * this.damping;

        let final_force = spring_force + damping_force;

        let force_a = dist_norm.mult_scaler(final_force);

        let delta_a_b = this.a.pos.clone().sub(this.b.pos);
        let dist_a_b = delta_a_b.mag();
        let dist_norm_a_b = delta_a_b.div_scaler(dist_a_b);

        let force_b = dist_norm_a_b.mult_scaler(final_force);

        this.a.addForce(force_a.x, force_a.y);
        this.b.addForce(force_b.x, force_b.y);
    }

    update_old() {
        let force = this.b.pos.clone().sub(this.a.pos);
        let x = force.mag() - this.restLength;

        force.normalize();
        force.mult_scaler(this.k * x);

        this.a.addForce(force.x, force.y);
        force.mult_scaler(-1);
        this.b.addForce(force.x, force.y);
    }

    xpbd_constraint(dt: number) {
        let delta = this.b.pos.clone().sub(this.a.pos);
        let dist = delta.mag();
        if (dist < 1e-6) return;

        let dir = delta.div_scaler(dist);
        let C = dist - this.restLength;

        let alpha_tilde = this.compliance / (dt * dt);

        // equal mass assumed (invMass = 1)
        let w = 1 + 1;

        // XPBD lambda update
        let delta_lambda = (-C - alpha_tilde * this.lambda) / (w + alpha_tilde);

        this.lambda += delta_lambda;

        let correction = dir.mult_scaler(delta_lambda);

        this.a.pos.sub(correction);
        this.b.pos.add(correction);
    }

    show(p: p5) {
        p.strokeWeight(4);
        p.stroke(255);
        p.line(this.a.pos.x, this.a.pos.y, this.b.pos.x, this.b.pos.y);
    }
}
