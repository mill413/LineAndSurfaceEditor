import {FKLine} from "./FKLine.js"
import {Vector3} from "three";

class FKBSpline extends FKLine {
    constructor(controlPoints, color = Math.random() * 0xffffff, degree = 3, type) {
        super(getBSplinePoints(controlPoints, type, degree), color)
        this.degree = degree
        this.order = degree + 1
        this.btype = type

        this.selected = this.getSegmentByIndex(0,controlPoints)
        this.selectedLine = new FKLine(this.selected)
    }

    //TODO-无法使用this.btype
    updateBSpline(controlPoints, type) {
        this.points.length = 0
        getBSplinePoints(controlPoints, type, this.degree).forEach(pts => {
            this.points.push(pts)
        })
    }

    getSegmentByIndex(selected, controlPoints) {
        let segment = []
        if (selected !== -1) {
            for (let i = selected; i < Math.min(selected + degree + 1, controlPointsCount); i++) {
                for (let t = knot[i]; t <= knot[i + 1]; t += (knot[i + 1] - knot[i]) / division) {
                    segment.push(calculateBSplinePoint(controlPoints, t))
                }
            }
        }
        return segment
    }

    updateSelected(selected,controlPoints){
        this.selected.length = 0
        this.getSegmentByIndex(selected,controlPoints).forEach(pts=>{
            this.selected.push(pts)
        })
    }
}

let degree = 3 // 次数
let order = 4 // 阶数
let knot = [] // 节点向量
let controlPointsCount = 4 // 控制点数

let division = 200

/**
 * 获取b样条曲线采样点
 * @param controlPoints 控制点列表
 * @param type b样条类型：1.uniform - 均匀b样条（默认） 2.nonUniform - 准均匀b样条
 * @param deg b样条曲线次数，默认为3次
 * @returns {[]} b样条曲线采样点列表
 */
function getBSplinePoints(controlPoints, type, deg = 3) {
    const bSplinePoints = []

    controlPointsCount = controlPoints.length
    degree = deg
    order = degree + 1

    generateKnots(type)

    for (let i = degree; i <= controlPointsCount - 1; i++) {
        for (let t = knot[i]; t <= knot[i + 1]; t += (knot[i + 1] - knot[i]) / division) {
            bSplinePoints.push(calculateBSplinePoint(controlPoints, t))
        }
    }

    return bSplinePoints
}

/**
 * 生成节点向量
 * @param type b样条类型：1.uniform - 均匀b样条（默认） 2.nonUniform - 准均匀b样条
 */
function generateKnots(type) {
    let knotCount = controlPointsCount + degree + 1
    knot.length = 0
    switch (type) {
        case "uniform": {
            for (let i = 0; i <= 1; i += 1 / (knotCount - 1)) {
                knot.push(i)
            }
            break
        }
        case "nonUniform": {
            for (let i = 0; i < degree; i++) {
                knot.push(0)
            }
            for (let i = 0; i <= 1; i += 1 / (knotCount - 2 * degree - 1)) {
                knot.push(i)
            }
            for (let i = 0; i < degree; i++) {
                knot.push(1)
            }
            break
        }
        case "": {
            break
        }
        case "nurbs": {
            break
        }
        default: {
            console.log("bSpline type error!")
        }
    }
}

/**
 * 计算参数u对应的b样条曲线上的点
 * @param controlPoints 控制点列表
 * @param u 参数
 * @returns {Vector3} 曲线上的点
 */
function calculateBSplinePoint(controlPoints, u) {
    let x = 0, y = 0, z = 0
    controlPoints.forEach((pts, ind) => {
        let baseNum = basis(ind, degree, u)
        x += pts.x * baseNum
        y += pts.y * baseNum
        z += pts.z * baseNum
    })
    return new Vector3(x, y, z)
}

/**
 * b样条基函数
 * @param i
 * @param k
 * @param t
 * @returns {number}
 */
function basis(i, k, t) {
    let res = 0

    if (k === 0) {
        if (t >= knot[i] && t < knot[i + 1]) return 1
        else return 0
    }
    if (k > 0) {
        if (t < knot[i] || t > knot[i + k + 1]) return 0
        else {
            let a, b
            let denominator

            denominator = knot[i + k] - knot[i]
            if (denominator === 0) a = 0
            else a = (t - knot[i]) / denominator

            denominator = knot[i + k + 1] - knot[i + 1]
            if (denominator === 0) b = 0
            else b = (knot[i + k + 1] - t) / denominator

            res = a * basis(i, k - 1, t) + b * basis(i + 1, k - 1, t)
        }
    }
    return res
}

export {FKBSpline}