import * as THREE from "three"
import {FKScene, makeTextSprite} from "./module/FKScene.js"
import {FKLine} from "./module/line/FKLine.js"
import GUI from "../lib/three/examples/jsm/libs/lil-gui.module.min.js"
import {FKBezierLine} from "./module/line/FKBezierLine.js"
import {FKBSpline} from "./module/line/FKBSpline.js"
import {FKPolyline} from "./module/line/FKPolyline.js";

let fk = new FKScene(render)

let pointsCount = 4
let controlPointsPositions = []
let pointSprites = []

const curves = {
    polyline: null,

    bezier: null,

    uniformBSpline: null,
    selectedUBSpline: null,

    nonUniformBSpline: null
}
let polylines = []

const gui = new GUI()
let GUIPreset = {}
const GUIParams = {
    polygon: true,
    bezierCurve: true,
    paramLines: true,
    uniformBSplineCurve: true,
    nonUniformBSplineCurve: true,
    param: 0.2,
    addPoint: addPoint,
    removePoint: removePoint,
    exportControlPoints: exportPoints,
    reset() {
        gui.load(GUIPreset)
        load([
            new THREE.Vector3(402.3456856807021, -359.44473917583423, 54.353753188060395),
            new THREE.Vector3(176.1970159507054, -161.64304516884437, 681.8143930609265),
            new THREE.Vector3(3.501474936503996, 1.367547955276109, -1.7474748760421903),
            new THREE.Vector3(-213.44857024934936, 198.71402830234328, 670.8935835257977),
            new THREE.Vector3(-377.5831221038151, 367.4348301980806, -3.780595169638346)]
        )
        render()
    }
}
const ColorParams = {
    polygon: "#ff0000",
    bezier: "#00ff33",
    uniformBSpline: "#996214",
    nonUniformBSpline: "#cc33e1"
}

let selectedPoint = 0

main()

function main() {
    fk.createInterface(updateCurve)

    setGUI()

    initialControlPoints()

    curves.polyline = new FKLine(controlPointsPositions, ColorParams.polygon)
    curves.bezier = new FKBezierLine(controlPointsPositions, ColorParams.bezier)

    polylines[0] = new FKPolyline(controlPointsPositions)
    for (let i = 1; i < pointsCount - 1; i++) {
        polylines.push(new FKPolyline(polylines[i - 1].exportPoints()))
    }

    curves.uniformBSpline = new FKBSpline(controlPointsPositions, ColorParams.uniformBSpline, 3, "uniform")

    curves.nonUniformBSpline = new FKBSpline(controlPointsPositions, ColorParams.nonUniformBSpline, 3, "nonUniform")

    for (const curvesKey in curves) {
        if (curves[curvesKey] != null) {
            fk.add(curves[curvesKey].curve)
        }
    }
    polylines.forEach(line => {
        fk.add(line.curve)
    })
    // fk.add(polylines[0].curve)

    load([
        new THREE.Vector3(402.3456856807021, -359.44473917583423, 54.353753188060395),
        new THREE.Vector3(176.1970159507054, -161.64304516884437, 681.8143930609265),
        new THREE.Vector3(3.501474936503996, 1.367547955276109, -1.7474748760421903),
        new THREE.Vector3(-213.44857024934936, 198.71402830234328, 670.8935835257977),
        new THREE.Vector3(-377.5831221038151, 367.4348301980806, -3.780595169638346)
    ])

    fk.render()
}

function render() {
    // 控制点序号文字显示
    pointSprites.forEach(ps => {
        fk.remove(ps)
    })
    pointSprites.length = 0
    for (let i = 0; i < controlPointsPositions.length; i++) {
        let ps = makeTextSprite("P" + (i + 1).toString(),
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
        document.getElementById("info").textContent = "当前选中的控制点为 P" + (selectedPoint + 1)
    } else {
        document.getElementById("info").textContent = "当前未选中控制点"
    }

    curves.polyline.curve.visible = GUIParams.polygon
    curves.polyline.curve.material.color.set(ColorParams.polygon)

    //region bezier
    curves.bezier.curve.visible = GUIParams.bezierCurve
    curves.bezier.curve.material.color.set(ColorParams.bezier)
    curves.bezier.getPointByParam(GUIParams.param)
    fk.add(curves.bezier.paramObj)

    polylines.forEach((line, index) => {
        if (index === 0) line.updatePolyline(controlPointsPositions, GUIParams.param)
        else line.updatePolyline(polylines[index - 1].exportPoints(), GUIParams.param)
        line.update()
        line.curve.visible = !(GUIParams.param === 0 || GUIParams.param === 1) && GUIParams.paramLines
    })
    //endregion

    curves.uniformBSpline.curve.visible = GUIParams.uniformBSplineCurve
    curves.uniformBSpline.curve.material.color.set(ColorParams.uniformBSpline)
    curves.uniformBSpline.getPointByParam(GUIParams.param)
    fk.add(curves.uniformBSpline.paramObj)
    //TODO-局部控制显示


    curves.nonUniformBSpline.curve.visible = GUIParams.nonUniformBSplineCurve
    curves.nonUniformBSpline.curve.material.color.set(ColorParams.nonUniformBSpline)
    curves.nonUniformBSpline.getPointByParam(GUIParams.param)
    fk.add(curves.nonUniformBSpline.paramObj)
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

function updateCurve() {
    polylines.forEach((line, index) => {
        if (index === 0) line.updatePolyline(controlPointsPositions, GUIParams.param)
        else line.updatePolyline(polylines[index - 1].exportPoints(), GUIParams.param)

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
                    curve.updateBSpline(controlPointsPositions)
                    break
                }
                case "nonUniformBSpline": {
                    curve.updateBSpline(controlPointsPositions)
                    break
                }
            }
            curve.update()
        }
    }
}

//region GUI
function setGUI() {
    gui.title("自由曲线控制面板")

    // gui.addColor(ColorParams, "background").name("背景颜色").onChange(render)
    gui.add(GUIParams, "param", 0, 1, 0.01).name("计算参数").onChange(fk.render)
    gui.add(GUIParams, "addPoint").name("添加点")
    gui.add(GUIParams, "removePoint").name("删除点")
    gui.add(GUIParams, "exportControlPoints").name("导出特征点")
    gui.add(GUIParams, "reset").name("重置")

    const polygonFolder = gui.addFolder("特征多边形")
    polygonFolder.add(GUIParams, "polygon").name("特征多边形").onChange(fk.render)
    polygonFolder.addColor(ColorParams, "polygon").name("颜色").onChange(fk.render)

    const bezierFolder = gui.addFolder("三次贝塞尔曲线")
    bezierFolder.add(GUIParams, "bezierCurve").name("贝塞尔曲线 ").onChange(fk.render)
    bezierFolder.addColor(ColorParams, "bezier").name("颜色").onChange(fk.render)
    bezierFolder.add(GUIParams, "paramLines").name("辅助线").onChange(fk.render)

    const bSplineFolder = gui.addFolder("三次b样条曲线")

    const uniformFolder = bSplineFolder.addFolder("均匀b样条曲线")
    uniformFolder.add(GUIParams, "uniformBSplineCurve").name("均匀b样条曲线").onChange(fk.render)
    uniformFolder.addColor(ColorParams, "uniformBSpline").name("颜色").onChange(fk.render)

    const nonUniformFolder = bSplineFolder.addFolder("准均匀b样条曲线")
    nonUniformFolder.add(GUIParams, "nonUniformBSplineCurve").name("准均匀b样条曲线").onChange(fk.render)
    nonUniformFolder.addColor(ColorParams, "nonUniformBSpline").name("颜色").onChange(fk.render)

    GUIPreset = gui.save()

    gui.open()
}

function addPoint() {
    pointsCount++

    controlPointsPositions.push(fk.addControlHelper().position)

    while (polylines.length < pointsCount - 2) {
        let new_pl = new FKPolyline(polylines[polylines.length - 1].exportPoints())
        fk.add(new_pl.curve)
        new_pl.updatePolyline(polylines[polylines.length - 1].exportPoints(), GUIParams.param)
        polylines.push(new_pl)
    }
    updateCurve()

    fk.render()
}

function removePoint() {
    if (pointsCount <= 4) {
        // alert("至少保留4个控制点！")
        return
    }

    const point = fk.helperObjects.pop()
    pointsCount--
    controlPointsPositions.pop()

    if (fk.transformControl.object === point) fk.transformControl.detach()
    fk.remove(point)

    while (polylines.length > pointsCount - 2) {
        fk.remove(polylines.pop().curve)
    }

    updateCurve()

    fk.render()
}

function exportPoints() {
    const output = []

    for (let i = 0; i < controlPointsPositions.length; i++) {
        const p = fk.helperObjects[i].position
        output.push(`new THREE.Vector3(${p.x}, ${p.y}, ${p.z})`)
    }

    console.log(output.join(',\n'))
    const code = '[' + (output.join(',\n\t')) + ']'
    prompt('copy and paste code', code)
}

//endregion

