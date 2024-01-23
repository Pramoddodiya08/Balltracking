import * as BABYLON from "@babylonjs/core";
import { Color3 } from "babylonjs";

const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas);

var createScene = async function () {
  var scene = new BABYLON.Scene(engine);

  var light = new BABYLON.DirectionalLight(
    "light",
    new BABYLON.Vector3(0, -0.5, 1.0),
    scene
  );
  light.position = new BABYLON.Vector3(0, 0, -2);
  var camera = new BABYLON.ArcRotateCamera(
    "camera",
    -Math.PI / 2,
    Math.PI / 4,
    3,
    new BABYLON.Vector3(0, 1, 0),
    scene
  );
  camera.attachControl(canvas, true);
  scene.activeCamera.beta += 0.8;

  const yellowMaterial = new BABYLON.StandardMaterial("redMaterial", scene);
  yellowMaterial.diffuseColor = new Color3.Yellow();

  const blueMaterial = new BABYLON.StandardMaterial("blueMaterial", scene);
  blueMaterial.diffuseColor = new Color3.Blue();

  var Box_Left_Trigger = BABYLON.MeshBuilder.CreateBox(
    "Box_Left_Trigger",
    {},
    scene
  );
  Box_Left_Trigger.position = new BABYLON.Vector3(-1.5, 2, 3);

  var Box_Left_Squeeze = BABYLON.MeshBuilder.CreateBox(
    "Box_Left_Squeeze",
    {},
    scene
  );
  Box_Left_Squeeze.position = new BABYLON.Vector3(-1.5, 0.7, 3);

  var Box_Left_ThumbStick = BABYLON.MeshBuilder.CreateBox(
    "Box_Left_ThumbStick",
    {},
    scene
  );
  Box_Left_ThumbStick.position = new BABYLON.Vector3(-1.5, -0.7, 3);

  var Sphere_Left_YButton = BABYLON.MeshBuilder.CreateSphere(
    "Sphere_Left_YButton",
    { diameter: 1 },
    scene
  );
  Sphere_Left_YButton.position = new BABYLON.Vector3(-3, 0.7, 3);

  var Sphere_Left_XButton = BABYLON.MeshBuilder.CreateSphere(
    "Sphere_Left_XButton",
    { diameter: 1 },
    scene
  );
  Sphere_Left_XButton.position = new BABYLON.Vector3(0.1, 0.7, 3);

  var Box_Right_Trigger = BABYLON.MeshBuilder.CreateBox(
    "Box_Right_Trigger",
    {},
    scene
  );
  Box_Right_Trigger.position = new BABYLON.Vector3(2.5, 2, 3);

  var Box_Right_Squeeze = BABYLON.MeshBuilder.CreateBox(
    "Box_Right_Squeeze",
    {},
    scene
  );
  Box_Right_Squeeze.position = new BABYLON.Vector3(2.5, 0.7, 3);

  var Sphere_Right_BButton = BABYLON.MeshBuilder.CreateSphere(
    "Sphere_Right_BButton",
    { diameter: 1 },
    scene
  );
  Sphere_Right_BButton.position = new BABYLON.Vector3(4, 0.7, 3);

  var Sphere_Right_AButton = BABYLON.MeshBuilder.CreateSphere(
    "Sphere_Right_AButton",
    { diameter: 1 },
    scene
  );
  Sphere_Right_AButton.position = new BABYLON.Vector3(1, 0.7, 3);

  var Box_Right_ThumbStick = BABYLON.MeshBuilder.CreateBox(
    "Box_Right_ThumbStick",
    {},
    scene
  );
  Box_Right_ThumbStick.position = new BABYLON.Vector3(2.5, -0.7, 3);

  var xr = await scene.createDefaultXRExperienceAsync({});
  xr.pointerSelection.detach();

  xr.input.onControllerAddedObservable.add((controller) => {
    controller.onMotionControllerInitObservable.add((motionController) => {
      if (motionController.handness === "left") {
        const xr_ids = motionController.getComponentIds();

        let triggerComponent = motionController.getComponent(xr_ids[0]);
        triggerComponent.onButtonStateChangedObservable.add(() => {
          if (triggerComponent.pressed) {
            Box_Left_Trigger.scaling = new BABYLON.Vector3(1.2, 1.2, 1.2);
            Box_Left_Trigger.material = yellowMaterial;
          } else {
            Box_Left_Trigger.scaling = new BABYLON.Vector3(1, 1, 1);
            Box_Left_Trigger.material = null;
          }
        });

        let squeezeComponent = motionController.getComponent(xr_ids[1]);
        squeezeComponent.onButtonStateChangedObservable.add(() => {
          if (squeezeComponent.pressed) {
            Box_Left_Squeeze.scaling = new BABYLON.Vector3(1.2, 1.2, 1.2);
            Box_Left_Squeeze.material = yellowMaterial;
          } else {
            Box_Left_Squeeze.scaling = new BABYLON.Vector3(1, 1, 1);
            Box_Left_Squeeze.material = null;
          }
        });

        let thumbstickComponent = motionController.getComponent(xr_ids[2]);
        thumbstickComponent.onButtonStateChangedObservable.add(() => {
          if (thumbstickComponent.pressed) {
            Box_Left_ThumbStick.scaling = new BABYLON.Vector3(1.2, 1.2, 1.2);
            Box_Left_ThumbStick.material = yellowMaterial;
          } else {
            Box_Left_ThumbStick.scaling = new BABYLON.Vector3(1, 1, 1);
            Box_Left_ThumbStick.material = null;
          }
        });

        let xbuttonComponent = motionController.getComponent(xr_ids[3]);
        xbuttonComponent.onButtonStateChangedObservable.add(() => {
          if (xbuttonComponent.pressed) {
            Sphere_Left_XButton.scaling = new BABYLON.Vector3(1.2, 1.2, 1.2);
            Sphere_Left_XButton.material = yellowMaterial;
          } else {
            Sphere_Left_XButton.scaling = new BABYLON.Vector3(1, 1, 1);
            Sphere_Left_XButton.material = null;
          }
        });

        let ybuttonComponent = motionController.getComponent(xr_ids[4]);
        ybuttonComponent.onButtonStateChangedObservable.add(() => {
          if (ybuttonComponent.pressed) {
            Sphere_Left_YButton.scaling = new BABYLON.Vector3(1.2, 1.2, 1.2);
            Sphere_Left_YButton.material = yellowMaterial;
          } else {
            Sphere_Left_YButton.scaling = new BABYLON.Vector3(1, 1, 1);
            Sphere_Left_YButton.material = null;
          }
        });
      }

      if (motionController.handness === "right") {
        const xr_ids = motionController.getComponentIds();
        let triggerComponent = motionController.getComponent(xr_ids[0]);
        triggerComponent.onButtonStateChangedObservable.add(() => {
          if (triggerComponent.pressed) {
            Box_Right_Trigger.scaling = new BABYLON.Vector3(1.2, 1.2, 1.2);
            Box_Right_Trigger.material = blueMaterial;
          } else {
            Box_Right_Trigger.scaling = new BABYLON.Vector3(1, 1, 1);
            Box_Right_Trigger.material = null;
          }
        });
        let squeezeComponent = motionController.getComponent(xr_ids[1]);
        squeezeComponent.onButtonStateChangedObservable.add(() => {
          if (squeezeComponent.pressed) {
            Box_Right_Squeeze.scaling = new BABYLON.Vector3(1.2, 1.2, 1.2);
            Box_Right_Squeeze.material = blueMaterial;
          } else {
            Box_Right_Squeeze.scaling = new BABYLON.Vector3(1, 1, 1);
            Box_Right_Squeeze.material = null;
          }
        });
        let thumbstickComponent = motionController.getComponent(xr_ids[2]);
        thumbstickComponent.onButtonStateChangedObservable.add(() => {
          if (thumbstickComponent.pressed) {
            Box_Right_ThumbStick.scaling = new BABYLON.Vector3(1.2, 1.2, 1.2);
            Box_Right_ThumbStick.material = blueMaterial;
          } else {
            Box_Right_ThumbStick.scaling = new BABYLON.Vector3(1, 1, 1);
            Box_Right_ThumbStick.material = null;
          }
        });
        let abuttonComponent = motionController.getComponent(xr_ids[3]);
        abuttonComponent.onButtonStateChangedObservable.add(() => {
          if (abuttonComponent.pressed) {
            Sphere_Right_AButton.scaling = new BABYLON.Vector3(1.2, 1.2, 1.2);
            Sphere_Right_AButton.material = blueMaterial;
          } else {
            Sphere_Right_AButton.scaling = new BABYLON.Vector3(1, 1, 1);
            Sphere_Right_AButton.material = null;
          }
        });
        let bbuttonComponent = motionController.getComponent(xr_ids[4]);
        bbuttonComponent.onButtonStateChangedObservable.add(() => {
          if (bbuttonComponent.pressed) {
            Sphere_Right_BButton.scaling = new BABYLON.Vector3(1.2, 1.2, 1.2);
            Sphere_Right_BButton.material = blueMaterial;
          } else {
            Sphere_Right_BButton.scaling = new BABYLON.Vector3(1, 1, 1);
            Sphere_Right_BButton.material = null;
          }
        });
      }
    });
  });

  return scene;
};

const scene = await createScene();

engine.runRenderLoop(function () {
  scene.render();
});

window.addEventListener("resize", function () {
  engine.resize();
});
