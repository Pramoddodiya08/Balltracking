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

  var camera;
  var gposition;
  var ground;
  var gameStarted = false;
  var gameOver = false;

  await scene.enablePhysics(
    new BABYLON.Vector3(0, -9.81, 0),
    new BABYLON.CannonJSPlugin(true, 10, CANNON)
  );

  var light = new BABYLON.HemisphericLight(
    "light1",
    new BABYLON.Vector3(0, 1, 0),
    scene
  );
  light.intensity = 1;

  var ground = BABYLON.MeshBuilder.CreateGround(
    "ground",
    { width: 20, height: 300 },
    scene
  );
  ground.physicsImpostor = new BABYLON.PhysicsImpostor(
    ground,
    BABYLON.PhysicsImpostor.BoxImpostor,
    { mass: 0 },
    scene
  );
  ground.checkCollisions = true;
  var boundingInfo = ground.getBoundingInfo();
  var p = boundingInfo.boundingSphere.maximum.z;
  const groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
  groundMaterial.diffuseTexture = new BABYLON.Texture("images/wood.jpg");
  groundMaterial.diffuseTexture.uScale = 10;
  groundMaterial.diffuseTexture.vScale = 100;
  ground.material = groundMaterial;
  let groundMesh;

  const sphere = BABYLON.MeshBuilder.CreateSphere(
    "sphere",
    { diameter: 1 },
    scene
  );
  sphere.position.y = 1.2;
  sphere.position.z = -145;
  // sphere.position.z = p - 50;

  const sphereMaterial = new BABYLON.StandardMaterial("sphereMaterial", scene);
  sphereMaterial.diffuseTexture = new BABYLON.Texture("images/green.jpg");
  sphere.material = sphereMaterial;

  sphere.physicsImpostor = new BABYLON.PhysicsImpostor(
    sphere,
    BABYLON.PhysicsImpostor.SphereImpostor,
    { mass: 1 },
    scene
  );

  await BABYLON.SceneLoader.ImportMesh(
    "",
    "images/",
    "final.glb",
    scene,
    function (meshes, particleSystem, skeletons, animation) {
      groundMesh = meshes[0];

      console.log(groundMesh);
      groundMesh.id = "groundMesh";
      groundMesh.name = "groundMesh";
      groundMesh.position = new BABYLON.Vector3(0, 0, -155);
      groundMesh.rotation = new BABYLON.Vector3(0, -300, 0);
      groundMesh.physicsImpostor = new BABYLON.PhysicsImpostor(
        groundMesh,
        BABYLON.PhysicsImpostor.BoxImpostor,
        { mass: 0 },
        scene
      );
    }
  );

  const positions = [
    { x: 2, z: p - 50 - 15, w: 15 },
    { x: 4, z: p - 50 - 30, w: 10 },
    { x: -4, z: p - 50 - 45, w: 10 },
    { x: 4, z: p - 50 - 60, w: 10 },
    { x: -4, z: p - 50 - 75, w: 10 },
    { x: 4, z: p - 50 - 90, w: 10 },
    { x: -4, z: p - 50 - 105, w: 10 },
    { x: 4, z: p - 50 - 120, w: 10 },
    { x: 0, z: p - 50 - 135, w: 10 },
    { x: -2, z: p - 50 - 150, w: 15 },
    { x: 3, z: p - 50 - 165, w: 15 },
    { x: -3, z: p - 50 - 180, w: 15 },
    { x: 2, z: p - 50 - 195, w: 15 },
  ];

  let newBox;
  for (let i = 0; i < positions.length; i++) {
    const position = positions[i];
    newBox = BABYLON.MeshBuilder.CreateBox(
      `box${i}`,
      { size: 3, height: 3, width: positions[i].w },
      scene
    );
    newBox.position.y = 1.5;
    newBox.material = new BABYLON.StandardMaterial("mat1");
    newBox.material.diffuseTexture = new BABYLON.Texture(
      "images/texture/crate.png"
    );
    newBox.position = new BABYLON.Vector3(position.x, 1.5, position.z);
    newBox.physicsImpostor = new BABYLON.PhysicsImpostor(
      newBox,
      BABYLON.PhysicsImpostor.BoxImpostor,
      { mass: 0 },
      scene
    );
    newBox.physicsImpostor.registerOnPhysicsCollide(
      [sphere.physicsImpostor],
      detectCollition
    );
  }

  function detectCollition(impact) {
    const data = impact.object.id.includes("box");
    if (data) {
      gameOver = true;
      gameOverText.isVisible = true;
    }
    if (sphere.physicsImpostor) {
      sphere.physicsImpostor.mass = 0;
    }
  }

  var advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
  var startGameButton = GUI.Button.CreateSimpleButton(
    "startGameButton",
    "Start Game"
  );
  startGameButton.width = "200px";
  startGameButton.height = "60px";
  startGameButton.color = "white";
  startGameButton.cornerRadius = 10;
  startGameButton.background = "green";
  startGameButton.onPointerClickObservable.add(() => {
    startGame();
    startGameButton.isVisible = false;
    scene.activeCamera = camera;
  });
  advancedTexture.addControl(startGameButton);

  var gameOverText = new GUI.TextBlock("gameOverText");
  gameOverText.text = "Game Over!";
  gameOverText.color = "white";
  gameOverText.fontSize = 48;
  gameOverText.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
  gameOverText.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
  gameOverText.isVisible = false;
  advancedTexture.addControl(gameOverText);

  let forwardVelocity = 1;
  let horizontalVelocity = 15.0;

  function startGame() {
    gameStarted = true;
    let isMovingLeft = false;
    let isMovingRight = false;

    scene.onBeforeRenderObservable.add(() => {
      if (gameStarted && !gameOver) {
        sphere.position.z -= (forwardVelocity * engine.getDeltaTime()) / 1000;
        sphere.rotation.y -= -10;
        camera.position.z -= (forwardVelocity * engine.getDeltaTime()) / 1000;
        if (isMovingLeft) {
          sphere.position.x +=
            (horizontalVelocity * engine.getDeltaTime()) / 1000;
        }
        if (isMovingRight) {
          sphere.position.x -=
            (horizontalVelocity * engine.getDeltaTime()) / 1000;
        }
      }
    });

    window.addEventListener("keydown", function (event) {
      if (gameOver || !gameStarted) {
        return;
      } else {
        switch (event.key) {
          case "w":
          case "ArrowUp":
            forwardVelocity = 9.5;
            break;
          case "a":
          case "ArrowLeft":
            isMovingLeft = true;
            break;
          case "d":
          case "ArrowRight":
            isMovingRight = true;
            break;
        }
        if (
          Math.abs(sphere.position.x) > 10 ||
          Math.abs(sphere.position.z) > 250
        ) {
          gameOverText.isVisible = true;
          gameOver = true;
          gameStarted = false;
        }
      }
    });

    window.addEventListener("keyup", function (event) {
      if (event.key === "a" || event.key === "ArrowLeft") {
        isMovingLeft = false;
      } else if (event.key === "d" || event.key === "ArrowRight") {
        isMovingRight = false;
      }
    });
  }

  var camera = new BABYLON.FollowCamera(
    "FollowCam",
    new BABYLON.Vector3(0, 10, -10),
    scene
  );
  camera.rotation = new BABYLON.Vector3(0, 0, 0);
  camera.heightOffset = 5;
  camera.lockedTarget = sphere;
  camera.lowerRadiusLimit = 5;
  camera.upperRadiusLimit = 20;
  camera.lowerHeightOffsetLimit = 5;
  camera.upperHeightOffsetLimit = 15;

  gameOverText.isVisible = false;

  window.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      startGame();
      startGameButton.isVisible = false;
    }
  });

  const env = CubeTexture.CreateFromPrefilteredData(
    "images/environment.env",
    scene
  );
  scene.environmentTexture = env;
  scene.createDefaultSkybox(env, true);

  return scene;
};

const scene = await createScene();

engine.runRenderLoop(function () {
  scene.render();
});

window.addEventListener("resize", function () {
  engine.resize();
});
