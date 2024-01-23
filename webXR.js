import * as BABYLON from "@babylonjs/core";
import * as CANNON from "cannon";
import { CannonJSPlugin, Vector3, Color3 } from "babylonjs";

const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas);

var createScene = async function () {
  var scene = new BABYLON.Scene(engine);
  await scene.enablePhysics(
    new Vector3(0, -9.81, 0),
    new CannonJSPlugin(true, 10, CANNON)
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
  camera.setPosition(new BABYLON.Vector3(0, 0, -20));
  camera.lowerBetaLimit = Math.PI / 3;
  camera.upperBetaLimit = Math.PI / 2.2;
  camera.lowerRadiusLimit = 10;
  camera.upperRadiusLimit = 30;

  var light = new BABYLON.HemisphericLight(
    "light1",
    new BABYLON.Vector3(0, 1, 0),
    scene
  );
  light.intensity = 0.7;

  var ground = BABYLON.MeshBuilder.CreateGround(
    "ground",
    { width: 500, height: 500 },
    scene
  );
  ground.physicsImpostor = new BABYLON.PhysicsImpostor(
    ground,
    BABYLON.PhysicsImpostor.BoxImpostor,
    {
      mass: 0,
      friction: 0.8,
      restitution: 0.5,
    },
    scene
  );
  // ground.checkCollisions = true;

  const groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
  groundMaterial.diffuseTexture = new BABYLON.Texture("images/black.jpg");
  ground.material = groundMaterial;

  let drum;
  let bullet;

  const xr = await scene.createDefaultXRExperienceAsync({
    floorMeshes: [ground],
  });
  scene.onPointerObservable.add((event) => {
    if (event.type === BABYLON.PointerEventTypes.POINTERPICK) {
      const inputSource = xr.pointerSelection.getXRControllerByPointerId(
        event.event.pointerId
      );
      if (
        !inputSource ||
        (inputSource && inputSource.motionController.handness === "right")
      ) {
        bullet = BABYLON.MeshBuilder.CreateSphere("bullet", {
          diameter: 0.2,
        });
        const boxMaterial = new BABYLON.StandardMaterial("boxMaterial", scene);
        boxMaterial.diffuseColor = new Color3.Yellow();
        bullet.material = boxMaterial;
        bullet.name = "bullet";
        const ray = event.pickInfo.ray;
        ray.direction.scaleInPlace(0.2);
        bullet.position.copyFrom(ray.origin);
        bullet.position.addInPlace(ray.direction);
        bullet.physicsImpostor = new BABYLON.PhysicsImpostor(
          bullet,
          BABYLON.PhysicsImpostor.SphereImpostor,
          { mass: 10, friction: 0.8, restitution: 0.9 }
        );
        bullet.physicsImpostor.setLinearVelocity(ray.direction.scale(400));
        bullet.checkCollisions = true;
      }
    }
  });
  let numberOfBoxes = 10;
  for (let i = 0; i < numberOfBoxes; i++) {
    const box = BABYLON.MeshBuilder.CreateBox(
      "box" + i,
      { size: 3, height: 5 },
      scene
    );
    const positions = [
      { x: 10, y: 1, z: 10 },
      { x: 20, y: 1, z: 30 },
      { x: 50, y: 1, z: 50 },
      { x: -50, y: 1, z: -50 },
      { x: 30, y: 1, z: 40 },
      { x: -10, y: 1, z: -30 },
      { x: -10, y: 1, z: -20 },
      { x: -10, y: 1, z: -10 },
      { x: -20, y: 1, z: -20 },
      { x: -30, y: 1, z: -20 },
    ];
    box.position = new BABYLON.Vector3(
      positions[i].x,
      positions[i].y,
      positions[i].z
    );
    const boxMaterial = new BABYLON.StandardMaterial("boxMaterial", scene);
    boxMaterial.diffuseColor = new Color3.FromHexString("#13FF00");
    box.material = boxMaterial;
    box.physicsImpostor = new BABYLON.PhysicsImpostor(
      box,
      BABYLON.PhysicsImpostor.BoxImpostor,
      { mass: 0, restitution: 0.5, friction: 0.5 },
      scene
    );
    box.checkCollisions = true;
    box.physicsImpostor.onCollideEvent = (collider, collidedWith) => {
      if (collidedWith.object.id === "bullet") {
        const explosionPosition = box.position.clone();
        createExplosion(explosionPosition, scene);
        box.dispose();
        setTimeout(() => {
          particleSystem.stop();
        }, 500);
      }
    };
  }

  var environment = scene.createDefaultEnvironment({
    createGround: false,
    skyboxSize: 1000,
  });
  environment.setMainColor(Color3.FromHexString("#C0FFF8"));

  let particleSystem;
  function createExplosion(position, scene) {
    particleSystem = new BABYLON.ParticleSystem("fireParticles", 200, scene);
    particleSystem.particleTexture = new BABYLON.Texture(
      "images/fire.png",
      scene
    );
    particleSystem.emitter = position;
    particleSystem.minEmitBox = new BABYLON.Vector3(-0.5, 0, -0.5);
    particleSystem.maxEmitBox = new BABYLON.Vector3(0.5, 0, 0.5);
    particleSystem.color1 = new BABYLON.Color4(1, 0.5, 0, 1);
    particleSystem.color2 = new BABYLON.Color4(1, 0.2, 0, 1);
    particleSystem.colorDead = new BABYLON.Color4(0, 0, 0, 0.0);
    particleSystem.minSize = 0.1;
    particleSystem.maxSize = 0.5;
    particleSystem.minLifeTime = 0.3;
    particleSystem.maxLifeTime = 1.5;
    particleSystem.emitRate = 1000;
    particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
    particleSystem.gravity = new BABYLON.Vector3(0, -9.81, 0);
    particleSystem.direction1 = new BABYLON.Vector3(-2, 8, -2);
    particleSystem.direction2 = new BABYLON.Vector3(2, 8, 2);
    particleSystem.minAngularSpeed = 0;
    particleSystem.maxAngularSpeed = Math.PI;
    particleSystem.start();
  }

  return scene;
};

const scene = await createScene();

engine.runRenderLoop(function () {
  scene.render();
});

window.addEventListener("resize", function () {
  engine.resize();
});
