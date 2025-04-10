import * as BABYLON from "@babylonjs/core";
import * as GUI from "@babylonjs/gui/2D";
import { CannonJSPlugin, Vector3 } from "babylonjs";
import * as CANNON from "cannon";
(async () => {
  const canvas = document.getElementById("renderCanvas");
  const engine = new BABYLON.Engine(canvas);

  let allowBallFiring = false;
  let Level;

  const createScene = async () => {
    const scene = new BABYLON.Scene(engine);

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
      "HemiLight",
      new BABYLON.Vector3(0, 1, 0),
      scene
    );

    const ground = new BABYLON.MeshBuilder.CreateGround(
      "ground",
      { width: 40, height: 40 },
      scene
    );
    const groundMaterial = new BABYLON.StandardMaterial(
      "groundMaterial",
      scene
    );
    groundMaterial.diffuseColor = new BABYLON.Color3(0.69, 0.93, 0.49);
    ground.material = groundMaterial;

    const box = new BABYLON.MeshBuilder.CreateBox(
      "box",
      {
        size: 2,
        width: 1,
        height: 0.1,
      },
      scene
    );
    box.position.y = 0.2;
    const boxMaterial = new BABYLON.StandardMaterial("boxMaterial", scene);
    boxMaterial.diffuseColor = new BABYLON.Color3(1, 0, 0);
    box.material = boxMaterial;

    const particles = function () {
      const positions = [
        new BABYLON.Vector3(5, 1, 0),
        new BABYLON.Vector3(0, 1, 0),
        new BABYLON.Vector3(-5, 1, 0),
      ];

      const particleSystems = [];

      for (const position of positions) {
        const particleSystem = BABYLON.ParticleHelper.CreateDefault(position);
        particleSystem.color1 = new BABYLON.Color4(1, 0, 0, 1);
        particleSystem.maxEmitBox = new BABYLON.Vector3(1, 3, 1);
        particleSystem.start();
        particleSystem.emitRate = 1500;
        particleSystems.push(particleSystem);
      }
    };

    const firstScene = function (scene, camera) {
      const plane = BABYLON.MeshBuilder.CreatePlane("plane", {
        height: 10,
        width: 15,
        sideOrientation: BABYLON.Mesh.DOUBLESIDE,
      });
      plane.position.y = 5;
      plane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;

      var advancedTexture = GUI.AdvancedDynamicTexture.CreateForMesh(plane);
      var button1 = GUI.Button.CreateSimpleButton("button", "START GAME");
      button1.width = 0.18;
      button1.height = 0.1;
      button1.color = "white";
      button1.fontSize = 24;
      button1.fontWeight = "bold";
      button1.background = "blue";
      button1.zIndex = 1;
      button1.hoverCursor = "pointer";

      button1.onPointerUpObservable.add(function () {
        allowBallFiring = true;
        plane.isVisible = false;
        secondScene(scene, Level);
        advancedTexture.dispose();
      });
      var textblock = new GUI.TextBlock();

      textblock.text =
        "YOU CAN HIT THE SKULL AND THROUGH IT \n\n FROM BOX FOR WIN THE GAME ";
      textblock.fontSize = 40;
      textblock.color = "yellow";
      textblock.paddingTop = "20px";
      textblock.fontWeight = "bold";
      textblock.background = "black";
      textblock.zIndex = 0;

      textblock.top = -80;
      button1.top = 80;

      advancedTexture.addControl(button1);
      advancedTexture.addControl(textblock);
    };

    const secondScene = function () {
      const boundaryWidth = 1;

      var boundaryHeight;
      if (Level === "Easy") {
        boundaryHeight = 1;
      } else if (Level === "Hard") {
        boundaryHeight = 3;
      }
      let skull;
      BABYLON.SceneLoader.ImportMesh(
        "",
        "images/",
        "skull.babylon",
        scene,
        function (newMeshes) {
          skull = newMeshes[0];
          skull.scaling = new BABYLON.Vector3(0.03, 0.03, 0.03);
          skull.position.y = 1.5;
          skull.position.z = 15;
          skull.updateFacetData();
          skull.physicsImpostor = new BABYLON.PhysicsImpostor(
            skull,
            BABYLON.PhysicsImpostor.SphereImpostor,
            { mass: 1, restitution: 0.5 },
            scene
          );
        }
      );

      let ball;

      scene.onPointerObservable.add((eventData) => {
        if (
          allowBallFiring &&
          eventData.type === BABYLON.PointerEventTypes.POINTERDOWN
        ) {
          ball = BABYLON.MeshBuilder.CreateSphere(
            "ball",
            { diameter: 0.5 },
            scene
          );
          const ballMaterial = new BABYLON.StandardMaterial(
            "ballMaterial",
            scene
          );
          ballMaterial.diffuseColor = new BABYLON.Color3(
            Math.random(),
            Math.random(),
            Math.random()
          );
          ball.material = ballMaterial;
          ball.position = box.position.clone();
          ball.checkCollisions = true;

          ball.physicsImpostor = new BABYLON.PhysicsImpostor(
            ball,
            BABYLON.PhysicsImpostor.SphereImpostor,
            { mass: 1, restitution: 1 },
            scene
          );

          const direction = BABYLON.Vector3.Normalize(
            camera.getTarget().subtract(camera.position)
          );
          ball.physicsImpostor.applyImpulse(
            direction.scale(20),
            ball.getAbsolutePosition()
          );
        }
      });
      scene.onBeforeRenderObservable.add(() => {
        checkCollisions();
      });

      const leftWall = BABYLON.MeshBuilder.CreateBox(
        "leftWall",
        { width: boundaryWidth, height: boundaryHeight, depth: 40 },
        scene
      );
      leftWall.position.x = -20 - boundaryWidth / 2;
      leftWall.position.y = boundaryHeight / 2;
      leftWall.physicsImpostor = new BABYLON.PhysicsImpostor(
        leftWall,
        BABYLON.PhysicsImpostor.BoxImpostor,
        { mass: 0, restitution: 0.9 },
        scene
      );

      const rightWall = BABYLON.MeshBuilder.CreateBox(
        "rightWall",
        { width: boundaryWidth, height: boundaryHeight, depth: 40 },
        scene
      );
      rightWall.position.x = 20 + boundaryWidth / 2;
      rightWall.position.y = boundaryHeight / 2;
      rightWall.physicsImpostor = new BABYLON.PhysicsImpostor(
        rightWall,
        BABYLON.PhysicsImpostor.BoxImpostor,
        { mass: 0, restitution: 0.9 },
        scene
      );

      const backWall = BABYLON.MeshBuilder.CreateBox(
        "backWall",
        { width: 40, height: boundaryHeight, depth: boundaryWidth },
        scene
      );
      backWall.position.z = -20 - boundaryWidth / 2;
      backWall.position.y = boundaryHeight / 2;
      backWall.physicsImpostor = new BABYLON.PhysicsImpostor(
        backWall,
        BABYLON.PhysicsImpostor.BoxImpostor,
        { mass: 0, restitution: 0.9 },
        scene
      );

      const frontWall = BABYLON.MeshBuilder.CreateBox(
        "frontWall",
        { width: 40, height: boundaryHeight, depth: boundaryWidth },
        scene
      );
      frontWall.position.z = 20 + boundaryWidth / 2;
      frontWall.position.y = boundaryHeight / 2;
      frontWall.physicsImpostor = new BABYLON.PhysicsImpostor(
        frontWall,
        BABYLON.PhysicsImpostor.BoxImpostor,
        { mass: 0, restitution: 0.9 },
        scene
      );

      ground.physicsImpostor = new BABYLON.PhysicsImpostor(
        ground,
        BABYLON.PhysicsImpostor.BoxImpostor,
        { mass: 0, restitution: 0.9 },
        scene
      );

      const boundaryWalls = [leftWall, rightWall, backWall, frontWall];

      const wallMaterial = new BABYLON.StandardMaterial(`wallMaterial`, scene);
      wallMaterial.diffuseTexture = new BABYLON.Texture(
        `images/wood.jpg`,
        scene
      );

      for (let i = 0; i < boundaryWalls.length; i++) {
        boundaryWalls[i].material = wallMaterial;
      }

      let collisionDetected = false;
      function checkCollisions() {
        if (skull && !collisionDetected) {
          const skullPosition = skull.getAbsolutePosition();
          const isOutsideBoundary =
            skullPosition.x < -20 - boundaryWidth / 2 ||
            skullPosition.x > 20 + boundaryWidth / 2 ||
            skullPosition.z < -20 - boundaryWidth / 2 ||
            skullPosition.z > 20 + boundaryWidth / 2;

          if (isOutsideBoundary) {
            allowBallFiring = false;
            collisionDetected = true;
            thirdScene(scene);
            return;
          }
        }
      }
    };

    const thirdScene = function () {
      particles();
      const plane = BABYLON.MeshBuilder.CreatePlane("plane", {
        height: 10,
        width: 15,
        sideOrientation: BABYLON.Mesh.DOUBLESIDE,
      });
      plane.position.y = 5;
      plane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
      var advancedTexture = GUI.AdvancedDynamicTexture.CreateForMesh(plane);
      var button1 = GUI.Button.CreateSimpleButton("button", "RESTART NOW");
      button1.width = 0.18;
      button1.height = 0.1;
      button1.color = "white";
      button1.fontSize = 24;
      button1.fontWeight = "bold";
      button1.background = "blue";
      button1.zIndex = 1;
      button1.hoverCursor = "pointer";

      button1.onPointerUpObservable.add(function () {
        allowBallFiring = true;
        plane.isVisible = false;
        advancedTexture.dispose();
        window.location.reload();
        secondScene(scene);
      });
      var textblock = new GUI.TextBlock();

      textblock.text = "HURRAH !!!\n\n YOU WON THE GAME ";
      textblock.fontSize = 40;
      textblock.color = "yellow";
      textblock.paddingTop = "20px";
      textblock.fontWeight = "bold";
      textblock.background = "black";
      textblock.zIndex = 0;

      textblock.top = -80;
      button1.top = 80;

      advancedTexture.addControl(button1);
      advancedTexture.addControl(textblock);
    };

    const skybox = BABYLON.MeshBuilder.CreateBox(
      "skybox",
      { size: 500 },
      scene
    );
    skybox.infiniteDistance = true;
    const skyboxMaterial = new BABYLON.StandardMaterial("skyboxMat", scene);
    skyboxMaterial.backFaceCulling = false;
    const files = [
      "images/skybox2_px.jpg",
      "images/skybox2_py.jpg",
      "images/skybox2_pz.jpg",
      "images/skybox2_nx.jpg",
      "images/skybox2_ny.jpg",
      "images/skybox2_nx.jpg",
    ];
    skyboxMaterial.reflectionTexture = BABYLON.CubeTexture.CreateFromImages(
      files,
      scene
    );
    skyboxMaterial.reflectionTexture.coordinatesMode =
      BABYLON.Texture.SKYBOX_MODE;
    skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    skybox.material = skyboxMaterial;

    const selectLevelPage = function () {
      const plane = BABYLON.MeshBuilder.CreatePlane("plane", {
        height: 10,
        width: 15,
      });
      plane.position.y = 5;
      plane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
      let levelSelected = false;

      var advancedTexture = GUI.AdvancedDynamicTexture.CreateForMesh(plane);
      var textblock = new GUI.TextBlock();

      textblock.text = "PLEASE SELECT LEVEL TO PLAY ";
      textblock.fontSize = 40;
      textblock.color = "yellow";
      textblock.paddingTop = "20px";
      textblock.fontWeight = "bold";
      textblock.background = "black";

      const createButton = function (
        text,
        onClickCallback,
        topOffset = 0,
        leftOffset = 0
      ) {
        const button = GUI.Button.CreateSimpleButton("button", text);
        button.width = 0.18;
        button.height = 0.1;
        button.color = "white";
        button.fontSize = 24;
        button.fontWeight = "bold";
        button.background = "blue";
        button.zIndex = 1;
        button.hoverCursor = "pointer";
        button.top = topOffset;
        // button.left = leftOffset;

        button.onPointerUpObservable.add(() => {
          if (!levelSelected) {
            onClickCallback();
            levelSelected = true;
          }
        });
        return button;
      };
      const level1Btn = createButton(
        "Easy",
        function () {
          Level = "Easy";
          plane.dispose();
          firstScene(scene, camera);
        },
        150
        // -100
      );
      const level2Btn = createButton(
        "Hard",
        function () {
          Level = "Hard";
          plane.dispose();
          firstScene(scene, camera, Level);
        },
        270
        // 100
      );

      advancedTexture.addControl(textblock);
      advancedTexture.addControl(level1Btn);
      advancedTexture.addControl(level2Btn);
    };

    // firstScene(scene, camera);
    selectLevelPage();

    return scene;
  };

  const scene = await createScene();

  engine.runRenderLoop(function () {
    scene.render();
  });

  window.addEventListener("resize", function () {
    engine.resize();
  });
})();
