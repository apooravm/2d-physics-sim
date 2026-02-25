import { Particle } from "./particle";
import { Spring } from "./spring";

export type Mesh = {
    points: Particle[];
    springs: Spring[];
};
