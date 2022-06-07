import * as THREE from "three"
import {FKScene, makeTextSprite} from "./module/FKScene.js"
import {FKLine} from "./module/line/FKLine.js"
import GUI from "../lib/three/examples/jsm/libs/lil-gui.module.min.js"
import {FKBezierLine} from "./module/line/FKBezierLine.js"
import {FKBSpline} from "./module/line/FKBSpline.js"
import {FKPolyline} from "./module/line/FKPolyline.js";

let fk = new FKScene(preRender)

const paramPointGeometry = new THREE.OctahedronGeometry(15)

let pointsCount = 4
let controlPointsPositions = []
let pointSprites = []

const curves = {
    polyline: null,
    bezier: null,

    uniformBSpline: null,
    selectedUBSpline: null,

    nonUniformBSpline: null,
}
let bezierPolylines = []

const gui = new GUI()
let GUIPreset = {}
const GUIParams = {
    polygon: true,

    bezierCurve: true,
    paramLines: false,

    uniformBSplineCurve: true,
    uniKnot: false,

    nonUniformBSplineCurve: true,
    nUniKnot: false,

    param: 0,
    addPoint: addPoint,
    removePoint: removePoint,
    exportControlPoints() {
        const output = []

        for (let i = 0; i < controlPointsPositions.length; i++) {
            const p = fk.helperObjects[i].position
            output.push(`new THREE.Vector3(${p.x}, ${p.y}, ${p.z})`)
        }

        console.log(output.join(',\n'))
        const code = '[' + (output.join(',\n\t')) + ']'
        prompt('copy and paste code', code)
    },
    reset() {
        gui.load(GUIPreset)
        load([new THREE.Vector3(402.3456856807021, -359.44473917583423, 54.353753188060395),
            new THREE.Vector3(346.8125024949029, -272.3433799148405, 518.2174880019243),
            new THREE.Vector3(-142.0449860756824, -141.48763041694255, 797.9367548987695),
            new THREE.Vector3(-291.8744276203363, 346.80593749070823, 505.6251227341942),
            new THREE.Vector3(-377.5831221038151, 367.4348301980806, -3.780595169638346)]
        )
        fk.render()
    }
}
const ColorParams = {
    polygon: "#ff0000",
    bezier: "#00ff33",
    uniformBSpline: "#996214",
    nonUniformBSpline: "#cc33e1"
}

let uniKnotSprite = []
let uniKnotsObj = []

let nUniKnotSprite = []
let nUniKnotsObj = []

let selectedPoint = -1

main()

function main() {

    fk.createInterface(updateCurve)
    setGUI()
    initialControlPoints()

    curves.polyline = new FKLine(controlPointsPositions, ColorParams.polygon)
    curves.bezier = new FKBezierLine(controlPointsPositions, ColorParams.bezier)
    bezierPolylines[0] = new FKPolyline(controlPointsPositions)
    for (let i = 1; i < pointsCount - 1; i++) {
        bezierPolylines.push(new FKPolyline(bezierPolylines[i - 1].exportPoints()))
    }
    curves.uniformBSpline = new FKBSpline(controlPointsPositions, ColorParams.uniformBSpline, 3, "uniform")
    curves.nonUniformBSpline = new FKBSpline(controlPointsPositions, ColorParams.nonUniformBSpline, 3, "nonUniform")

    for (const curvesKey in curves) {
        if (curves[curvesKey] != null) {
            fk.add(curves[curvesKey].curve)
        }
    }
    bezierPolylines.forEach(line => {
        fk.add(line.curve)
    })

    load([new THREE.Vector3(402.3456856807021, -359.44473917583423, 54.353753188060395),
        new THREE.Vector3(346.8125024949029, -272.3433799148405, 518.2174880019243),
        new THREE.Vector3(-142.0449860756824, -141.48763041694255, 797.9367548987695),
        new THREE.Vector3(-291.8744276203363, 346.80593749070823, 505.6251227341942),
        new THREE.Vector3(-377.5831221038151, 367.4348301980806, -3.780595169638346)])

    fk.render()
}

function setGUI() {
    gui.title("自由曲线控制面板")

    gui.add(GUIParams, "param", 0, 1, 0.01).name("计算参数").onChange(fk.render)
    gui.add(GUIParams, "addPoint").name("添加点")
    gui.add(GUIParams, "removePoint").name("删除点")
    gui.add(GUIParams, "exportControlPoints").name("导出特征点")
    gui.add(GUIParams, "reset").name("重置")

    const polygonFolder = gui.addFolder("特征多边形")
    polygonFolder.add(GUIParams, "polygon").name("特征多边形").onChange(() => {
        curves.polyline.curve.visible = GUIParams.polygon
        fk.render()
    })
    polygonFolder.addColor(ColorParams, "polygon").name("颜色").onChange(() => {
        curves.polyline.curve.material.color.set(ColorParams.polygon)
        fk.render()
    })

    const bezierFolder = gui.addFolder("贝塞尔曲线")
    bezierFolder.add(GUIParams, "bezierCurve").name("贝塞尔曲线 ").onChange(() => {
        curves.bezier.curve.visible = GUIParams.bezierCurve
        fk.render()
    })
    bezierFolder.addColor(ColorParams, "bezier").name("颜色").onChange(() => {
        curves.bezier.curve.material.color.set(ColorParams.bezier)
        fk.render()
    })
    bezierFolder.add(GUIParams, "paramLines").name("辅助线").onChange(fk.render)

    const bSplineFolder = gui.addFolder("三次B样条曲线")

    const uniformFolder = bSplineFolder.addFolder("均匀b样条曲线")
    uniformFolder.add(GUIParams, "uniformBSplineCurve").name("均匀b样条曲线").onChange(() => {
        curves.uniformBSpline.curve.visible = GUIParams.uniformBSplineCurve
        fk.render()
    })
    uniformFolder.addColor(ColorParams, "uniformBSpline").name("颜色").onChange(() => {
        curves.uniformBSpline.curve.material.color.set(ColorParams.uniformBSpline)
        fk.render()
    })
    uniformFolder.add(GUIParams, "uniKnot").name("节点").onChange(fk.render)

    const nonUniformFolder = bSplineFolder.addFolder("准均匀b样条曲线")
    nonUniformFolder.add(GUIParams, "nonUniformBSplineCurve").name("准均匀b样条曲线").onChange(() => {
        curves.nonUniformBSpline.curve.visible = GUIParams.nonUniformBSplineCurve
        fk.render()
    })
    nonUniformFolder.addColor(ColorParams, "nonUniformBSpline").name("颜色").onChange(() => {
        curves.nonUniformBSpline.curve.material.color.set(ColorParams.nonUniformBSpline)
        fk.render()
    })
    nonUniformFolder.add(GUIParams, "nUniKnot").name("节点").onChange(fk.render)

    GUIPreset = gui.save()

    gui.open()
}

function initialControlPoints() {
    for (let i = 0; i < pointsCount; i++) {
        fk.addControlHelper(controlPointsPositions[i])
    }

    controlPointsPositions.length = 0

    for (let i = 0; i < pointsCount; i++) {
        controlPointsPositions.push(fk.helperObjects[i].position)
    }

}

function load(new_positions) {
    while (new_positions.length > controlPointsPositions.length) {
        addPoint()
    }

    while (new_positions.length < controlPointsPositions.length) {
        removePoint()
    }

    for (let i = 0; i < controlPointsPositions.length; i++) {
        controlPointsPositions[i].copy(new_positions[i])
    }

    updateCurve()
}

function addPoint() {
    pointsCount++

    controlPointsPositions.push(fk.addControlHelper().position)

    while (bezierPolylines.length < pointsCount - 2) {
        let new_pl = new FKPolyline(bezierPolylines[bezierPolylines.length - 1].exportPoints())
        fk.add(new_pl.curve)
        new_pl.updatePolyline(bezierPolylines[bezierPolylines.length - 1].exportPoints(), GUIParams.param)
        bezierPolylines.push(new_pl)
    }

    updateCurve()

    fk.render()
}

function removePoint() {
    if (pointsCount <= 4) {
        alert("至少保留4个控制点！")
        return
    }

    pointsCount--
    controlPointsPositions.pop()

    const point = fk.helperObjects.pop()
    if (fk.transformControl.object === point) fk.transformControl.detach()
    fk.remove(point)

    while (bezierPolylines.length > pointsCount - 2) {
        fk.remove(bezierPolylines.pop().curve)
    }

    updateCurve()

    fk.render()
}

function updateCurve() {
    bezierPolylines.forEach((line, index) => {
        if (index === 0)
            line.updatePolyline(controlPointsPositions, GUIParams.param)
        else
            line.updatePolyline(bezierPolylines[index - 1].exportPoints(), GUIParams.param)
        line.update()
    })

    for (const k in curves) {
        const curve = curves[k]
        if (curve != null) {
            switch (k) {
                case "bezier": {
                    curve.updateBezier(controlPointsPositions)
                    break
                }

                case "uniformBSpline": {
                    curve.updateBSpline(controlPointsPositions, "uniform")
                    break
                }

                case "nonUniformBSpline": {
                    curve.updateBSpline(controlPointsPositions, "nonUniform")
                    break
                }
            }
            curve.update()
        }
    }
}

function preRender() {
    // 控制点序号文字显示
    pointSprites.forEach(ps => {
        fk.remove(ps)
    })
    pointSprites.length = 0
    for (let i = 0; i < controlPointsPositions.length; i++) {
        let ps = makeTextSprite("P" + (i).toString(),
            {fontsize: 100})
        fk.add(ps)
        pointSprites.push(ps)
    }
    pointSprites.forEach((ps, ind) => {
        ps.position.set(controlPointsPositions[ind].x, controlPointsPositions[ind].y, controlPointsPositions[ind].z)
    })

    // 获取选中的控制点下标
    if (fk.transformControl.object !== undefined) {
        controlPointsPositions.forEach((cp, ind) => {
            if (cp === fk.transformControl.object.position) {
                selectedPoint = ind
            }
        })
    } else {
        selectedPoint = -1
    }
    if (selectedPoint !== -1) {
        document.getElementById("info").textContent = "当前选中的控制点为 P" + (selectedPoint) + "(" + (
            Math.round(fk.helperObjects[selectedPoint].position.x) + ","
            + Math.round(fk.helperObjects[selectedPoint].position.y) + ","
            + Math.round(fk.helperObjects[selectedPoint].position.z)
        ) + ")"
    } else {
        document.getElementById("info").textContent = "当前未选中控制点"
    }

    //region bezier
    curves.bezier.getPointByParam(GUIParams.param)
    fk.add(curves.bezier.paramObj)

    bezierPolylines.forEach((line, index) => {
        if (index === 0) line.updatePolyline(controlPointsPositions, GUIParams.param)
        else line.updatePolyline(bezierPolylines[index - 1].exportPoints(), GUIParams.param)
        line.update()
        line.curve.visible = !(GUIParams.param === 0 || GUIParams.param === 1) && GUIParams.paramLines
    })
    //endregion

    //region uniformBSpline
    curves.uniformBSpline.getPointByParam(GUIParams.param)
    fk.add(curves.uniformBSpline.paramObj)

    //节点显示
    let uniKnotPoints = curves.uniformBSpline.getKnotsPoints(controlPointsPositions)
    uniKnotSprite.forEach(ks => {
        fk.remove(ks)
    })
    uniKnotSprite.length = 0
    for (let i = 0; i < uniKnotPoints.length; i++) {
        let ks = makeTextSprite("K" + (i).toString(),
            {fontsize: 50})
        fk.add(ks)
        uniKnotSprite.push(ks)
    }
    uniKnotSprite.forEach((ks, ind) => {
        let ksp = uniKnotPoints[ind]
        ks.position.set(ksp.x, ksp.y, ksp.z + ind * 2)
        ks.visible = GUIParams.uniformBSplineCurve && GUIParams.uniKnot
    })
    uniKnotsObj.forEach(ko => fk.remove(ko))
    uniKnotsObj.length = 0
    uniKnotPoints.forEach((k) => {
        let obj = new THREE.Mesh(paramPointGeometry, new THREE.MeshLambertMaterial({color: ColorParams.uniformBSpline}))
        obj.position.copy(k)
        obj.visible = GUIParams.uniformBSplineCurve && GUIParams.uniKnot
        fk.add(obj)
        uniKnotsObj.push(obj)
    })
    //endregion

    //region nonUniformBSpline
    curves.nonUniformBSpline.getPointByParam(GUIParams.param)
    fk.add(curves.nonUniformBSpline.paramObj)

    //节点显示
    let nUniKnotPoints = curves.nonUniformBSpline.getKnotsPoints(controlPointsPositions)
    nUniKnotSprite.forEach(ks => {
        fk.remove(ks)
    })
    nUniKnotSprite.length = 0
    for (let i = 0; i < nUniKnotPoints.length; i++) {
        let ks = makeTextSprite("K" + (i).toString(),
            {fontsize: 50})
        fk.add(ks)
        nUniKnotSprite.push(ks)
    }
    nUniKnotSprite.forEach((ks, ind) => {
        let ksp = nUniKnotPoints[ind]
        ks.position.set(ksp.x, ksp.y, ksp.z + ind * 5)
        ks.visible = GUIParams.nonUniformBSplineCurve && GUIParams.nUniKnot
    })
    nUniKnotsObj.forEach(ko => fk.remove(ko))
    nUniKnotsObj.length = 0
    nUniKnotPoints.forEach((k) => {
        let obj = new THREE.Mesh(paramPointGeometry, new THREE.MeshLambertMaterial({color: ColorParams.nonUniformBSpline}))
        obj.position.copy(k)
        obj.material.color.set(curves.nonUniformBSpline.material.color)
        obj.visible = GUIParams.nUniKnot && GUIParams.nUniKnot
        fk.add(obj)
        nUniKnotsObj.push(obj)
    })
    //endregion
}


