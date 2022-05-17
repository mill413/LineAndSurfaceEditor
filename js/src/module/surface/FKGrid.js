import {FKLine} from "../line/FKLine.js";
import {FKSurface} from "./FKSurface.js";

export class FKGrid extends FKSurface{
    constructor(controlPoints,lineColor,surfaceColor) {
        super()

        for (let i = 0; i < 4; i++) {
            this.row[i] = new FKLine(controlPoints[i],lineColor)
            this.column[i] = new FKLine([
                controlPoints[0][i],
                controlPoints[1][i],
                controlPoints[2][i],
                controlPoints[3][i]
            ],surfaceColor)
        }
    }
}