import p5 from "p5";
import { Vec2 } from "./utils";

export class Particle {
    pos: Vec2;
    vel: Vec2;
    acc: Vec2;
    density: number;
    pressure: number;
    mass: number;
    force: Vec2;
    radius: number;
    maxVel: number;
    frictionRate: number;
    screenW: number;
    screenH: number;
    locked: boolean;

    constructor(x: number, y: number, radius: number, screenW: number, screenH: number) {
        this.pos = new Vec2(x, y);
        // this.vel = new Vec2(Math.random() - 0.5, Math.random() - 0.5);
        this.vel = new Vec2(0, 0);
        this.acc = new Vec2(0, 0);
        this.force = new Vec2(0, 0);
        this.mass = 1;
        this.maxVel = 40;
        this.radius = radius;
        this.frictionRate = 1;
        this.screenW = screenW;
        this.screenH = screenH;
        this.density = 1;
        this.pressure = 1;
        this.locked = false;
    }

    handleBoundaries() {
        if (this.pos.x > this.screenW - this.radius / 2) {
            this.pos.x = this.screenW - this.radius / 2;
            this.vel.x *= -1 * this.frictionRate;
        } else if (this.pos.x < this.radius / 2) {
            this.pos.x = this.radius / 2;
            this.vel.x *= -1 * this.frictionRate;
        }

        if (this.pos.y > this.screenH - this.radius / 2) {
            this.pos.y = this.screenH - this.radius / 2;
            this.vel.y *= -1 * this.frictionRate;
        } else if (this.pos.y < this.radius / 2) {
            this.pos.y = this.radius / 2;
            this.vel.y = Math.random() - 0.5 * this.frictionRate;
        }
    }

    specialBoundaryX(x: number) {
        if (x > this.screenW - 5) {
            return;
        }
        if (this.pos.x < x + this.radius / 2) {
            this.pos.x = x + this.radius / 2;
            this.vel.x *= -1 * this.frictionRate;
        }
    }

    specialBoundaryY(y: number) {
        if (y > this.screenH - 5) {
            return;
        }
        if (this.pos.y < y + this.radius / 2) {
            this.pos.y = y + this.radius / 2;
            this.vel.y *= -1 * this.frictionRate;
        }
    }

    update(dt: number) {
        if (this.locked) {
            return;
        }

        // update vel
        this.vel.x += this.acc.x * dt;
        this.vel.y += this.acc.y * dt;

        // this.force.div(this.density)
        // this.force.mult(dt)
        // this.vel.add(this.force)

        // limit vel
        this.vel.x = Math.max(Math.min(this.vel.x, this.maxVel), -this.maxVel);
        this.vel.y = Math.max(Math.min(this.vel.y, this.maxVel), -this.maxVel);

        this.vel.mult_scaler(this.frictionRate);

        // update pos
        this.pos.x += this.vel.x * dt;
        this.pos.y += this.vel.y * dt;

        // bounce off wall
        if (this.pos.x > this.screenW - this.radius / 2) {
            this.pos.x = this.screenW - this.radius / 2;
            this.vel.x *= -1 * this.frictionRate;
        } else if (this.pos.x < this.radius / 2) {
            this.pos.x = this.radius / 2;
            this.vel.x *= -1 * this.frictionRate;
        }

        if (this.pos.y > this.screenH - this.radius / 2) {
            this.pos.y = this.screenH - this.radius / 2;
            this.vel.y *= -1 * this.frictionRate;
        } else if (this.pos.y < this.radius / 2) {
            this.pos.y = this.radius / 2;
            this.vel.y *= -1 * this.frictionRate;
        }

        // acc back to 0
        this.acc.x = 0;
        this.acc.y = 0;
    }

    particleCollision(p: Particle, p5: p5) {
        // check if particles overlap
        const dx = p.pos.x - this.pos.x;
        const dy = p.pos.y - this.pos.y;
        const dist = dx * dx + dy * dy;
        if (dist <= (p.radius + this.radius) ** 2) {
            p5.fill("orange");
            console.log(dist, (p.radius + this.radius) ** 2);

            // static response
            const dist_sq = this.pos.distance(p.pos);
            // value each particle to be moved by. 0.5 * since each particle gets half
            const disp_len = 0.5 * (dist_sq - this.radius - p.radius);

            this.pos.x -= (disp_len * (this.pos.x - p.pos.x)) / dist_sq;
            this.pos.y -= (disp_len * (this.pos.y - p.pos.y)) / dist_sq;

            p.pos.x += (disp_len * (this.pos.x - p.pos.x)) / dist_sq;
            p.pos.y += (disp_len * (this.pos.y - p.pos.y)) / dist_sq;
        } else {
            p5.fill("white");
        }
    }

    addForce(x: number, y: number) {
        this.acc.x += x;
        this.acc.y += y;
    }

    show(p: p5) {
        // p.stroke(255);
        p.strokeWeight(0);
        p.circle(this.pos.x, this.pos.y, this.radius * 2);
    }
}
