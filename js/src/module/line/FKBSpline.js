import {FKLine} from "./FKLine.js"
import {Vector3} from "three"

/**
 * @
 */
class FKBSpline extends FKLine {
    constructor(controlPoints, color = Math.random() * 0xffffff, degree = 3, type) {
        super(getBSplinePoints(controlPoints, type, degree), color)
        this.degree = degree
        this.btype = type
    }

    updateBSpline(controlPoints) {
        this.points.length = 0
        getBSplinePoints(controlPoints, this.btype, this.degree).forEach(pts => {
            this.points.push(pts)
        })
    }

    getKnotsPoints(controlPoints) {
        let knots = generateKnots(this.btype, controlPoints.length, this.degree)
        let koc = []
        for (let i = 0; i < knots.length; i++) {
            koc.push(calculateBSplinePoint(controlPoints, knots[i], this.degree, knots))
        }
        return koc
    }
}

/**
 * 获取b样条曲线采样点
 * @param {[Vector3]} controlPoints 控制点列表
 * @param {string} type b样条类型：1.uniform - 均匀b样条（默认） 2.nonUniform - 准均匀b样条
 * @param {number} degree b样条曲线次数，默认为3次
 * @param {number} division 分割次数，默认为200
 * @returns {[Vector3]} b样条曲线采样点列表
 */
function getBSplinePoints(controlPoints, type, degree = 3, division = 200) {
    const bSplinePoints = []

    const controlPointsCount = controlPoints.length

    const knot = generateKnots(type, controlPointsCount, degree)

    for (let i = degree; i < controlPointsCount; i++) {
        for (let t = knot[i]; t <= knot[i + 1]; t += (knot[i + 1] - knot[i]) / division) {
            bSplinePoints.push(calculateBSplinePoint(controlPoints, t, degree, knot))
        }
    }

    return bSplinePoints
}

/**
 * 生成节点向量
 * @param type b样条类型：1.uniform - 均匀b样条（默认） 2.nonUniform - 准均匀b样条
 * @param controlPointsCount
 * @param degree
 */
function generateKnots(type, controlPointsCount, degree) {
    let knot = []
    let knotCount = controlPointsCount + degree + 1
    knot.length = 0
    switch (type) {
        case "uniform": {
            for (let i = 0; i < knotCount; i++) {
                knot.push(i)
            }
            break
        }
        case "nonUniform": {
            let temp = 0
            for (let i = 0; i < degree + 1; i++) {
                knot.push(temp)
            }
            for (let i = 0; i < knotCount - 2 * (degree + 1); i++) {
                temp++
                knot.push(temp)
            }
            temp++
            for (let i = 0; i < degree + 1; i++) {
                knot.push(temp)
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
    return knot
}

/**
 * 计算参数u对应的b样条曲线上的点
 * @param controlPoints 控制点列表
 * @param u 参数
 * @param degree
 * @param knot
 * @returns {Vector3} 曲线上的点
 */
function calculateBSplinePoint(controlPoints, u, degree, knot) {
    let x = 0, y = 0, z = 0
    controlPoints.forEach((pts, ind) => {
        let baseNum = basis(ind, degree, u, knot)
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
 * @param knot
 * @returns {number}
 */
function basis(i, k, t, knot) {
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

            res = a * basis(i, k - 1, t, knot) + b * basis(i + 1, k - 1, t, knot)
        }
    }
    return res
}

export {FKBSpline}