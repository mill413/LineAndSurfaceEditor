import * as THREE from 'three'
import {FKLine} from "./FKLine.js"

class FKBezierLine extends FKLine {
    constructor(controlPoints, color = Math.random() * 0xffffff) {
        super(getBezierPoints(controlPoints), color)
    }

    updateBezier(controlPoints) {
        this.points.length = 0
        getBezierPoints(controlPoints, this.ARC_SEGMENTS).forEach(pts => {
            this.points.push(pts)
        })
    }
}

const factorialNums = [1] // 阶乘

getFactorial(10)

/**
 * 获取贝塞尔曲线上的采样点
 * @param controlPoints 控制点列表
 * @param division 采样率
 * @returns {[]} 贝塞尔曲线上的点
 */
function getBezierPoints(controlPoints, division = 200) {
    const bezierPoints = []
    for (let i = 0.0; i <= 1.0; i += 1 / division) {
        bezierPoints.push(calculateBezierPoint(controlPoints, i))
    }
    return bezierPoints
}

/**
 * 计算给定参数对应的贝塞尔曲线上的点
 * @param controlPoints 控制点列表
 * @param t 对应参数
 * @returns {Vector3} 参数对应的贝塞尔曲线上的点
 */
function calculateBezierPoint(controlPoints, t) {
    let n = controlPoints.length - 1
    let x = 0, y = 0, z = 0
    controlPoints.forEach(function (pts, i) {
        x += pts.x * bernsteinNum(i, n, t)
        y += pts.y * bernsteinNum(i, n, t)
        z += pts.z * bernsteinNum(i, n, t)
    })
    return new THREE.Vector3(x, y, z)
}

/**
 * bernstein基函数
 * @param i
 * @param n
 * @param t
 * @returns {number}
 */
function bernsteinNum(i, n, t) {
    let combination = getFactorial(n) / (getFactorial(i) * getFactorial(n - i))
    return combination * Math.pow(t, i) * Math.pow(1 - t, n - i)
}

/**
 * 阶乘
 * @param i
 * @returns {number}
 */
function getFactorial(i) {
    if (i >= factorialNums.length) {
        for (let t = factorialNums.length; t <= i; t++) {
            factorialNums[t] = factorialNums[t - 1] * t
        }
    }
    return factorialNums[i]
}


export {FKBezierLine}
