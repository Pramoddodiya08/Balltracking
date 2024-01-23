import * as BABYLON from "@babylonjs/core";
import * as CANNON from "cannon";
import "babylonjs-loaders";
import { CubeTexture, PhysicsImpostor, PBRMaterial, Vector3 } from "babylonjs";
import "@babylonjs/loaders/glTF";
import "@babylonjs/loaders/OBJ/objFileLoader";
import * as GUI from "@babylonjs/gui/2D";

const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas);

var createScene = async function () {
  const scene = new BABYLON.Scene(engine);
  await scene.enablePhysics(
    new BABYLON.Vector3(0, -9.81, 0),
    new BABYLON.CannonJSPlugin(true, 10, CANNON)
  );

  const camera = new BABYLON.ArcRotateCamera(
    "camera",
    0,
    0,
    10,
    new BABYLON.Vector3(0, 0, 0),
    scene
  );
  camera.attachControl(true);
  camera.setPosition(new BABYLON.Vector3(0, 10, -10));

  var light = new BABYLON.HemisphericLight(
    "HemiLight",
    new BABYLON.Vector3(0, 1, 0),
    scene
  );

  await BABYLON.SceneLoader.ImportMesh(
    "",
    "images/",
    "final7.glb",
    scene,
    function (meshes, particleSystem, skeletons, animation) {
      const groundMesh = meshes[0];
      groundMesh.id = "groundMesh";
      groundMesh.name = "groundMesh";
      groundMesh.physicsImpostor = new BABYLON.PhysicsImpostor(
        groundMesh,
        BABYLON.PhysicsImpostor.BoxImpostor,
        { mass: 0, friction: 1.0, restitution: 0.7 },
        scene
      );

      groundMesh.checkCollisions = true;
    }
  );
  const sphere = BABYLON.MeshBuilder.CreateSphere("sphere", {
    diameter: 1,
  });
  sphere.position = new Vector3(0, 2, 0);
  sphere.physicsImpostor = new BABYLON.PhysicsImpostor(
    sphere,
    BABYLON.PhysicsImpostor.SphereImpostor,
    { mass: 1, friction: 0.5, restitution: 0.7 },

    scene
  );
  sphere.checkCollisions = true;

  scene.registerBeforeRender(() => {
    sphere.physicsImpostor.setLinearVelocity(new BABYLON.Vector3(-2, 0, 0));
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
