import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { HARDWARE_PARTS } from '../data/hardwareParts.js';

export default function CocoPiReal3DViewer({ onSelectPart, targetCamPos, zoomTrigger, resetTrigger }) {
  const mountRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const animTargetPos = useRef(null);

  useEffect(() => {
    if (targetCamPos && cameraRef.current) {
      const target = new THREE.Vector3(...targetCamPos);
      if (cameraRef.current.aspect < 0.95 && target.length() < 8.6) {
        target.multiplyScalar(8.6 / Math.max(target.length(), 0.01));
      }
      animTargetPos.current = target;
    }
  }, [targetCamPos]);

  useEffect(() => {
    if (!zoomTrigger || !cameraRef.current || !controlsRef.current) return;
    const cam = cameraRef.current;
    const dir = new THREE.Vector3();
    cam.getWorldDirection(dir);
    const step = zoomTrigger.type === 'in' ? 0.85 : -0.85;
    const nextPos = cam.position.clone().addScaledVector(dir, step);
    if (nextPos.length() >= 2.5 && nextPos.length() <= 13) {
      cam.position.copy(nextPos);
      controlsRef.current.update();
    }
  }, [zoomTrigger]);

  useEffect(() => {
    if (!resetTrigger || !cameraRef.current || !controlsRef.current) return;
    controlsRef.current.target.set(0, 0, 0);
    animTargetPos.current =
      cameraRef.current.aspect < 0.95
        ? new THREE.Vector3(3.5, 2.1, 8.6)
        : new THREE.Vector3(2.8, 1.8, 5.2);
  }, [resetTrigger]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 680;
    const height = container.clientHeight || 440;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#eef5ff');

    const narrowViewport = width / height < 0.95;
    const camera = new THREE.PerspectiveCamera(
      narrowViewport ? 45 : 38,
      width / height,
      0.1,
      100
    );
    camera.position.set(...(narrowViewport ? [3.5, 2.1, 8.6] : [2.8, 1.8, 5.2]));
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.domElement.style.touchAction = 'none';
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const environmentTexture = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = environmentTexture;
    scene.environmentIntensity = 0.58;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enableZoom = true;
    controls.zoomSpeed = 1.15;
    controls.minDistance = 2.4;
    controls.maxDistance = 12.5;
    controls.minPolarAngle = 0.02;
    controls.maxPolarAngle = Math.PI - 0.02;
    controlsRef.current = controls;

    const stopAutoAnim = () => {
      animTargetPos.current = null;
    };
    controls.addEventListener('start', stopAutoAnim);

    scene.add(new THREE.HemisphereLight(0xe8f3ff, 0x5f6673, 1.25));

    const frontLight = new THREE.DirectionalLight(0xffffff, 2.1);
    frontLight.position.set(5.5, 7.5, 6.5);
    frontLight.castShadow = true;
    frontLight.shadow.mapSize.set(2048, 2048);
    frontLight.shadow.camera.near = 0.5;
    frontLight.shadow.camera.far = 24;
    frontLight.shadow.camera.left = -6;
    frontLight.shadow.camera.right = 6;
    frontLight.shadow.camera.top = 6;
    frontLight.shadow.camera.bottom = -6;
    frontLight.shadow.bias = -0.00035;
    frontLight.shadow.normalBias = 0.018;
    scene.add(frontLight);

    const backLight = new THREE.DirectionalLight(0xcfe2ff, 1.55);
    backLight.position.set(-6, 4, -7);
    scene.add(backLight);

    const fillLight = new THREE.DirectionalLight(0xfff3e8, 0.7);
    fillLight.position.set(-4, 1.5, 6);
    scene.add(fillLight);

    const bottomLight = new THREE.DirectionalLight(0xdbeafe, 0.46);
    bottomLight.position.set(0, -6, 2);
    scene.add(bottomLight);

    const createPeiTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');
      const imgData = ctx.createImageData(512, 512);
      for (let i = 0; i < imgData.data.length; i += 4) {
        const y = Math.floor(i / 4 / 512);
        const layer = Math.sin(y * 1.8) * 14;
        const noise = (Math.random() - 0.5) * 24;
        const v = Math.min(255, Math.max(0, 128 + layer + noise));
        imgData.data[i] = v;
        imgData.data[i + 1] = v;
        imgData.data[i + 2] = v;
        imgData.data[i + 3] = 255;
      }
      ctx.putImageData(imgData, 0, 0);
      const tex = new THREE.CanvasTexture(canvas);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(3, 2);
      tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
      return tex;
    };

    const bumpTex = createPeiTexture();

    const blackShellMat = new THREE.MeshPhysicalMaterial({
      color: 0x242931,
      roughness: 0.42,
      metalness: 0.16,
      bumpMap: bumpTex,
      bumpScale: 0.009,
      clearcoat: 0.28,
      clearcoatRoughness: 0.55,
      envMapIntensity: 0.82
    });

    const darkCavityMat = new THREE.MeshStandardMaterial({
      color: 0x080a0e,
      roughness: 0.82,
      metalness: 0.08
    });
    const whiteSwitchMat = new THREE.MeshPhysicalMaterial({
      color: 0xf8fafc,
      roughness: 0.22,
      clearcoat: 0.34,
      clearcoatRoughness: 0.28
    });
    const creamSocketMat = new THREE.MeshPhysicalMaterial({
      color: 0xf0ebe3,
      roughness: 0.34,
      clearcoat: 0.18,
      clearcoatRoughness: 0.46
    });
    const goldPinMat = new THREE.MeshPhysicalMaterial({
      color: 0xf6b928,
      roughness: 0.18,
      metalness: 0.92,
      envMapIntensity: 1.15
    });
    const silverMetalMat = new THREE.MeshPhysicalMaterial({
      color: 0xd5dde8,
      roughness: 0.2,
      metalness: 0.9,
      envMapIntensity: 1.2
    });

    const W = 4.2;
    const H = 2.7;
    const D = 1.45;
    const cocopiGroup = new THREE.Group();
    scene.add(cocopiGroup);

    const tagPart = (obj, partId) => {
      obj.userData.partId = partId;
      obj.traverse((c) => {
        c.userData.partId = partId;
      });
      return obj;
    };

    const createBodyMesh = () => {
      const shape = new THREE.Shape();
      const hw = W / 2;
      const hh = H / 2;
      const r = 0.14;
      const notchW = 0.28;
      const notchTopY = -0.16;
      const notchBotY = -hh + 0.22;

      shape.moveTo(-hw + r, hh);
      shape.lineTo(hw - r, hh);
      shape.quadraticCurveTo(hw, hh, hw, hh - r);
      shape.lineTo(hw, notchTopY);
      shape.lineTo(hw - notchW, notchTopY);
      shape.lineTo(hw - notchW, notchBotY);
      shape.lineTo(hw, notchBotY);
      shape.lineTo(hw, -hh + r);
      shape.quadraticCurveTo(hw, -hh, hw - r, -hh);
      shape.lineTo(-hw + r, -hh);
      shape.quadraticCurveTo(-hw, -hh, -hw, -hh + r);
      shape.lineTo(-hw, hh - r);
      shape.quadraticCurveTo(-hw, hh, -hw + r, hh);

      const geo = new THREE.ExtrudeGeometry(shape, {
        depth: D - 0.08,
        bevelEnabled: true,
        bevelSegments: 4,
        steps: 1,
        bevelSize: 0.04,
        bevelThickness: 0.04
      });
      geo.center();
      const mesh = new THREE.Mesh(geo, blackShellMat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      return tagPart(mesh, 'screen');
    };
    cocopiGroup.add(createBodyMesh());

    const createJstSocket = (pinCount, width, height, depth, partId) => {
      const group = new THREE.Group();
      const recess = new THREE.Mesh(
        new THREE.BoxGeometry(width + 0.05, height + 0.05, depth),
        darkCavityMat
      );
      group.add(recess);

      const wallT = 0.032;
      const topW = new THREE.Mesh(new THREE.BoxGeometry(width, wallT, depth), creamSocketMat);
      topW.position.y = height / 2 - wallT / 2;
      const botW = new THREE.Mesh(new THREE.BoxGeometry(width, wallT, depth), creamSocketMat);
      botW.position.y = -height / 2 + wallT / 2;
      const leftW = new THREE.Mesh(new THREE.BoxGeometry(wallT, height, depth), creamSocketMat);
      leftW.position.x = -width / 2 + wallT / 2;
      const rightW = new THREE.Mesh(new THREE.BoxGeometry(wallT, height, depth), creamSocketMat);
      rightW.position.x = width / 2 - wallT / 2;
      group.add(topW, botW, leftW, rightW);

      const spacing = (width - wallT * 2) / (pinCount + 1);
      for (let i = 1; i <= pinCount; i++) {
        const pin = new THREE.Mesh(
          new THREE.CylinderGeometry(0.015, 0.015, depth * 0.85, 8),
          goldPinMat
        );
        pin.rotation.x = Math.PI / 2;
        pin.position.x = -width / 2 + wallT + spacing * i;
        group.add(pin);
      }
      return tagPart(group, partId);
    };

    const createEmbossedLabel = (text, w, h, fontSize = 54, invertUpsideDown = false) => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, 512, 128);
      if (invertUpsideDown) {
        ctx.translate(256, 64);
        ctx.rotate(Math.PI);
        ctx.translate(-256, -64);
      }
      ctx.font = `900 ${fontSize}px "JetBrains Mono", "Microsoft YaHei", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#475569';
      ctx.fillText(text, 254, 62);
      ctx.fillStyle = '#090b0e';
      ctx.fillText(text, 258, 66);
      ctx.fillStyle = '#334155';
      ctx.fillText(text, 256, 64);

      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
      const mat = new THREE.MeshBasicMaterial({
        map: tex,
        transparent: true,
        depthWrite: false
      });
      return new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    };

    const createScreenTex = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 480;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, 640, 480);

      ctx.fillStyle = '#111827';
      ctx.fillRect(20, 18, 600, 44);
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText('11 : 00', 275, 48);
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText('100%', 505, 47);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.strokeRect(565, 29, 34, 18);
      ctx.fillStyle = '#10b981';
      ctx.fillRect(568, 32, 28, 12);

      const apps = [
        { name: '最近程序', color: '#0ea5e9', x: 130, y: 155, symbol: '▶' },
        { name: '系统设置', color: '#64748b', x: 320, y: 155, symbol: '⚙' },
        { name: '相机', color: '#22c55e', x: 510, y: 155, symbol: '📷' },
        { name: '智能识物', color: '#6366f1', x: 130, y: 335, symbol: '🧊' },
        { name: '智能物体检测', color: '#06b6d4', x: 320, y: 335, symbol: '⛶' },
        { name: '人脸情绪识别', color: '#f59e0b', x: 510, y: 335, symbol: '☺' }
      ];
      apps.forEach((app) => {
        ctx.fillStyle = app.color;
        ctx.beginPath();
        ctx.roundRect(app.x - 48, app.y - 48, 96, 96, 22);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 42px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(app.symbol, app.x, app.y + 15);
        ctx.fillStyle = '#cbd5e1';
        ctx.font = '20px "Microsoft YaHei", sans-serif';
        ctx.fillText(app.name, app.x, app.y + 82);
      });
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
      return texture;
    };

    const frontGroup = new THREE.Group();
    const screenBezel = new THREE.Mesh(
      new THREE.BoxGeometry(2.75, 2.02, 0.04),
      new THREE.MeshPhysicalMaterial({
        color: 0x080b10,
        roughness: 0.24,
        metalness: 0.28,
        clearcoat: 0.3,
        clearcoatRoughness: 0.24
      })
    );
    screenBezel.position.set(-0.22, 0.02, D / 2 - 0.005);
    frontGroup.add(screenBezel);

    const sTex = createScreenTex();
    const lcdMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(2.52, 1.84),
      new THREE.MeshStandardMaterial({
        map: sTex,
        roughness: 0.15,
        emissive: new THREE.Color(0xffffff),
        emissiveMap: sTex,
        emissiveIntensity: 0.24
      })
    );
    lcdMesh.position.set(-0.22, 0.02, D / 2 + 0.018);
    frontGroup.add(lcdMesh);

    const screenGlass = new THREE.Mesh(
      new THREE.PlaneGeometry(2.52, 1.84),
      new THREE.MeshPhysicalMaterial({
        color: 0xdbeafe,
        roughness: 0.06,
        metalness: 0.04,
        transparent: true,
        opacity: 0.13,
        clearcoat: 1,
        clearcoatRoughness: 0.04,
        depthWrite: false
      })
    );
    screenGlass.position.set(-0.22, 0.02, D / 2 + 0.032);
    frontGroup.add(screenGlass);

    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 4; c++) {
        const hole = new THREE.Mesh(
          new THREE.CylinderGeometry(0.036, 0.036, 0.06, 12),
          darkCavityMat
        );
        hole.rotation.x = Math.PI / 2;
        hole.position.set(1.48 + c * 0.125, 0.62 - r * 0.125, D / 2 - 0.01);
        frontGroup.add(hole);
      }
    }
    cocopiGroup.add(tagPart(frontGroup, 'screen'));

    const backGroup = new THREE.Group();
    const camBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.68, 0.72, 0.15, 36),
      new THREE.MeshStandardMaterial({ color: 0x262930, roughness: 0.45 })
    );
    camBase.rotation.x = Math.PI / 2;
    camBase.position.set(0, 0, -D / 2 - 0.04);
    backGroup.add(camBase);

    for (let i = 0; i < 28; i++) {
      const angle = (i / 28) * Math.PI * 2;
      const ridge = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.045, 0.14), blackShellMat);
      ridge.position.set(Math.cos(angle) * 0.69, Math.sin(angle) * 0.69, -D / 2 - 0.04);
      ridge.rotation.z = angle;
      backGroup.add(ridge);
    }

    const innerRing = new THREE.Mesh(
      new THREE.CylinderGeometry(0.36, 0.42, 0.18, 32),
      darkCavityMat
    );
    innerRing.rotation.x = Math.PI / 2;
    innerRing.position.set(0, 0, -D / 2 - 0.06);
    backGroup.add(innerRing);

    const lensGlass = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 24, 16),
      new THREE.MeshPhysicalMaterial({
        color: 0x0b1220,
        roughness: 0.05,
        metalness: 0.76,
        clearcoat: 1,
        clearcoatRoughness: 0.03,
        envMapIntensity: 1.35
      })
    );
    lensGlass.scale.z = 0.35;
    lensGlass.position.set(0, 0, -D / 2 - 0.11);
    backGroup.add(lensGlass);

    const pLabel = createEmbossedLabel('P0   P1   P2   P3', 2.6, 0.42, 54, true);
    pLabel.rotation.y = Math.PI;
    pLabel.position.set(-0.25, 1.02, -D / 2 - 0.006);
    backGroup.add(pLabel);

    const aLabel = createEmbossedLabel('A0   A1   A2   A3', 2.4, 0.42, 54, false);
    aLabel.rotation.y = Math.PI;
    aLabel.position.set(-0.35, -1.05, -D / 2 - 0.006);
    backGroup.add(aLabel);

    [
      [-1.92, 1.15],
      [1.92, 1.15],
      [-1.92, -1.15],
      [1.92, -1.15]
    ].forEach(([sx, sy]) => {
      const screw = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.05, 16), darkCavityMat);
      screw.rotation.x = Math.PI / 2;
      screw.position.set(sx, sy, -D / 2 - 0.003);
      backGroup.add(screw);
    });

    [
      [-1.52, 0.56],
      [1.52, 0.56],
      [-1.46, -0.56],
      [1.52, -0.56]
    ].forEach(([bx, by]) => {
      const brass = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.048, 0.05, 12), goldPinMat);
      brass.rotation.x = Math.PI / 2;
      brass.position.set(bx, by, -D / 2 - 0.003);
      backGroup.add(brass);
    });
    cocopiGroup.add(tagPart(backGroup, 'camera_back'));

    const leftGroup = new THREE.Group();
    ['M3', 'M4', 'M5', 'M6'].forEach((mText, idx) => {
      const yPos = 0.78 - idx * 0.52;
      const sock = createJstSocket(2, 0.34, 0.36, 0.12, 'power_switch_left');
      sock.rotation.y = -Math.PI / 2;
      sock.position.set(-W / 2 + 0.02, yPos, -0.05);
      leftGroup.add(sock);

      const lbl = createEmbossedLabel(mText, 0.45, 0.32, 68, false);
      lbl.rotation.y = -Math.PI / 2;
      lbl.position.set(-W / 2 - 0.006, yPos, 0.38);
      lbl.rotation.z = -Math.PI / 2;
      leftGroup.add(lbl);
    });

    const leftSwitchRecess = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.48, 0.38), darkCavityMat);
    leftSwitchRecess.position.set(-W / 2 + 0.02, 0.66, -0.44);
    leftGroup.add(leftSwitchRecess);

    const leftPowerSwitch = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.34, 0.32), whiteSwitchMat);
    leftPowerSwitch.position.set(-W / 2 - 0.04, 0.62, -0.44);
    leftGroup.add(leftPowerSwitch);
    cocopiGroup.add(tagPart(leftGroup, 'power_switch_left'));

    const rightGroup = new THREE.Group();
    const createRoundedFacePlate = (width, height, depth, radius, material) => {
      const shape = new THREE.Shape();
      const hw = width / 2;
      const hh = height / 2;
      shape.moveTo(-hw + radius, -hh);
      shape.lineTo(hw - radius, -hh);
      shape.quadraticCurveTo(hw, -hh, hw, -hh + radius);
      shape.lineTo(hw, hh - radius);
      shape.quadraticCurveTo(hw, hh, hw - radius, hh);
      shape.lineTo(-hw + radius, hh);
      shape.quadraticCurveTo(-hw, hh, -hw, hh - radius);
      shape.lineTo(-hw, -hh + radius);
      shape.quadraticCurveTo(-hw, -hh, -hw + radius, -hh);

      const geometry = new THREE.ExtrudeGeometry(shape, {
        depth,
        steps: 1,
        bevelEnabled: true,
        bevelSegments: 2,
        bevelSize: 0.008,
        bevelThickness: 0.008
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.rotation.y = Math.PI / 2;
      return mesh;
    };

    const typecHousing = createRoundedFacePlate(0.58, 0.78, 0.08, 0.08, blackShellMat);
    typecHousing.position.set(W / 2 - 0.18, -0.58, 0.27);
    rightGroup.add(typecHousing);

    const typecRecess = createRoundedFacePlate(0.34, 0.62, 0.07, 0.09, darkCavityMat);
    typecRecess.position.set(W / 2 - 0.1, -0.58, 0.27);
    rightGroup.add(typecRecess);

    const typecRim = createRoundedFacePlate(0.22, 0.48, 0.025, 0.11, silverMetalMat);
    typecRim.position.set(W / 2 - 0.045, -0.58, 0.27);
    rightGroup.add(typecRim);

    const typecCavity = createRoundedFacePlate(0.17, 0.42, 0.026, 0.085, darkCavityMat);
    typecCavity.position.set(W / 2 - 0.04, -0.58, 0.27);
    rightGroup.add(typecCavity);

    const typecTongue = new THREE.Mesh(
      new THREE.BoxGeometry(0.02, 0.18, 0.055),
      silverMetalMat
    );
    typecTongue.position.set(W / 2 - 0.012, -0.58, 0.27);
    rightGroup.add(typecTongue);

    const batteryHousing = createRoundedFacePlate(0.4, 0.58, 0.08, 0.04, blackShellMat);
    batteryHousing.position.set(W / 2 - 0.02, -0.04, -0.29);
    rightGroup.add(batteryHousing);

    const batteryCavity = createRoundedFacePlate(0.25, 0.4, 0.05, 0.025, darkCavityMat);
    batteryCavity.position.set(W / 2 + 0.035, -0.04, -0.29);
    rightGroup.add(batteryCavity);

    [-0.2, 0.2].forEach((dy) => {
      const trim = new THREE.Mesh(
        new THREE.BoxGeometry(0.022, 0.026, 0.3),
        creamSocketMat
      );
      trim.position.set(W / 2 + 0.09, -0.04 + dy, -0.29);
      rightGroup.add(trim);
    });

    [-0.145, 0.145].forEach((dz) => {
      const trim = new THREE.Mesh(
        new THREE.BoxGeometry(0.022, 0.36, 0.026),
        creamSocketMat
      );
      trim.position.set(W / 2 + 0.09, -0.04, -0.29 + dz);
      rightGroup.add(trim);
    });

    [-0.1, 0.1].forEach((dy) => {
      const batPin = new THREE.Mesh(
        new THREE.CylinderGeometry(0.034, 0.034, 0.065, 18),
        goldPinMat
      );
      batPin.rotation.z = Math.PI / 2;
      batPin.position.set(W / 2 + 0.1, -0.04 + dy, -0.29);
      rightGroup.add(batPin);
    });

    const switchFrame = createRoundedFacePlate(0.34, 0.5, 0.07, 0.035, creamSocketMat);
    switchFrame.position.set(W / 2 - 0.03, -0.72, -0.29);
    rightGroup.add(switchFrame);

    const switchTrack = createRoundedFacePlate(0.21, 0.36, 0.065, 0.025, darkCavityMat);
    switchTrack.position.set(W / 2 + 0.015, -0.72, -0.29);
    rightGroup.add(switchTrack);

    const extSwitchCap = new THREE.Mesh(
      new THREE.BoxGeometry(0.11, 0.24, 0.18),
      whiteSwitchMat
    );
    extSwitchCap.position.set(W / 2 + 0.08, -0.65, -0.29);
    rightGroup.add(extSwitchCap);

    const switchGroove = new THREE.Mesh(
      new THREE.BoxGeometry(0.012, 0.03, 0.11),
      darkCavityMat
    );
    switchGroove.position.set(W / 2 + 0.14, -0.65, -0.29);
    rightGroup.add(switchGroove);
    cocopiGroup.add(tagPart(rightGroup, 'right_io'));

    const topGroup = new THREE.Group();
    for (let i = 0; i < 4; i++) {
      const sock = createJstSocket(4, 0.52, 0.24, 0.14, 'top_sleep_ports');
      sock.rotation.x = -Math.PI / 2;
      sock.position.set(-1.25 + i * 0.68, H / 2 - 0.02, -0.42);
      topGroup.add(sock);
    }

    const sleepBtnBase = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.08, 0.36), darkCavityMat);
    sleepBtnBase.position.set(0.68, H / 2 - 0.01, 0.18);
    topGroup.add(sleepBtnBase);

    const sleepBtnCap = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.14, 0.3), whiteSwitchMat);
    sleepBtnCap.position.set(0.68, H / 2 + 0.04, 0.18);
    topGroup.add(sleepBtnCap);
    cocopiGroup.add(tagPart(topGroup, 'top_sleep_ports'));

    const bottomGroup = new THREE.Group();
    const m1Sock = createJstSocket(2, 0.36, 0.24, 0.14, 'bottom_ports');
    m1Sock.rotation.x = Math.PI / 2;
    m1Sock.position.set(-1.12, -H / 2 + 0.02, 0.12);
    bottomGroup.add(m1Sock);

    const m2Sock = createJstSocket(2, 0.36, 0.24, 0.14, 'bottom_ports');
    m2Sock.rotation.x = Math.PI / 2;
    m2Sock.position.set(-0.55, -H / 2 + 0.02, 0.12);
    bottomGroup.add(m2Sock);

    const uartSock = createJstSocket(4, 0.58, 0.24, 0.14, 'bottom_ports');
    uartSock.rotation.x = Math.PI / 2;
    uartSock.position.set(0.18, -H / 2 + 0.02, 0.12);
    bottomGroup.add(uartSock);

    const iicSock = createJstSocket(4, 0.58, 0.24, 0.14, 'bottom_ports');
    iicSock.rotation.x = Math.PI / 2;
    iicSock.position.set(0.95, -H / 2 + 0.02, 0.12);
    bottomGroup.add(iicSock);

    const botLabel = createEmbossedLabel('M1   M2    UART    IIC', 2.8, 0.34, 48, false);
    botLabel.rotation.x = Math.PI / 2;
    botLabel.position.set(-0.05, -H / 2 - 0.006, 0.42);
    bottomGroup.add(botLabel);

    for (let i = 0; i < 4; i++) {
      const aSock = createJstSocket(3, 0.46, 0.22, 0.14, 'bottom_ports');
      aSock.rotation.x = Math.PI / 2;
      aSock.position.set(-1.12 + i * 0.66, -H / 2 + 0.02, -0.42);
      bottomGroup.add(aSock);
    }

    [-1.56, 1.48].forEach((vx) => {
      [-0.02, 0.16, 0.34].forEach((vz) => {
        const diamond = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.06, 0.09), darkCavityMat);
        diamond.rotation.y = Math.PI / 4;
        diamond.position.set(vx, -H / 2 + 0.01, vz);
        bottomGroup.add(diamond);
      });
    });
    cocopiGroup.add(tagPart(bottomGroup, 'bottom_ports'));

    const contactShadow = new THREE.Mesh(
      new THREE.CircleGeometry(3.6, 64),
      new THREE.ShadowMaterial({
        color: 0x10203a,
        opacity: 0.2,
        transparent: true
      })
    );
    contactShadow.rotation.x = -Math.PI / 2;
    contactShadow.position.set(0, -H / 2 - 0.46, 0);
    contactShadow.receiveShadow = true;
    scene.add(contactShadow);

    cocopiGroup.traverse((child) => {
      if (!child.isMesh) return;
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      child.castShadow = !materials.some((material) => material?.transparent);
      child.receiveShadow = true;
    });

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let downX = 0;
    let downY = 0;

    const onMouseDown = (e) => {
      downX = e.clientX;
      downY = e.clientY;
    };

    const onMouseUp = (e) => {
      if (Math.hypot(e.clientX - downX, e.clientY - downY) < 5) {
        const rect = renderer.domElement.getBoundingClientRect();
        pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(pointer, camera);
        const hits = raycaster.intersectObjects(cocopiGroup.children, true);
        if (hits.length > 0) {
          const pid = hits[0].object.userData?.partId;
          if (pid && HARDWARE_PARTS[pid]) {
            onSelectPart(HARDWARE_PARTS[pid]);
          }
        }
      }
    };

    const domElem = renderer.domElement;
    domElem.addEventListener('mousedown', onMouseDown);
    domElem.addEventListener('mouseup', onMouseUp);

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.fov = camera.aspect < 0.95 ? 45 : 38;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    let reqId;
    const animate = () => {
      reqId = requestAnimationFrame(animate);
      if (animTargetPos.current) {
        camera.position.lerp(animTargetPos.current, 0.12);
        if (camera.position.distanceTo(animTargetPos.current) < 0.05) {
          animTargetPos.current = null;
        }
      }
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(reqId);
      controls.removeEventListener('start', stopAutoAnim);
      controls.dispose();
      domElem.removeEventListener('mousedown', onMouseDown);
      domElem.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('resize', handleResize);
      environmentTexture.dispose();
      pmremGenerator.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="relative h-[330px] w-full cursor-grab overflow-hidden rounded-[var(--radius-box)] border border-accent-line bg-accent-soft active:cursor-grabbing sm:h-[380px] lg:h-[470px]"
    />
  );
}
