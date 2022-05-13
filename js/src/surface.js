import * as THREE from "three"
import {FKScene} from "./module/FKScene.js";

let fk = new FKScene()

main()

function main() {
    fk.createInterface()

    fk.render()
}