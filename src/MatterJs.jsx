import { useEffect, useRef } from 'react';
import Matter from 'matter-js';
import ganadiImgSrc from './assets/main_ganadi_01.png';
import ganadiImgSrc2 from './assets/sub_ganadi_01.png';
import bg from './assets/bg.jpg';
import ball from './assets/ball.png';

export default function MatterJs() {
  const sceneRef = useRef(null);

  useEffect(() => {
    const { Engine, Render, Runner, Composite, Bodies, Mouse, MouseConstraint } = Matter;
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Engine: 중력/충돌 등 물리 연산만 담당하는 시뮬레이션 코어 (화면에는 아무것도 안 그림)
    const engine = Engine.create();
    // Render: engine의 world 상태를 매 프레임 canvas에 그려주는 역할 (렌더러일 뿐, 물리엔 관여 안 함)
    const render = Render.create({
      element: sceneRef.current, // 이 DOM 엘리먼트 안에 canvas를 생성해서 붙임
      engine,
      options: { width, height, wireframes: false, background: bg }, // wireframes가 있을 경우 외곽선만 그려지고 색상이 안 넣어짐
    });
    // Mouse: DOM 이벤트(클릭/드래그)를 world 좌표로 변환해주는 입력 소스
    const mouse = Mouse.create(render.canvas);
    // MouseConstraint: mouse로 잡은 지점과 body를 constraint로 연결해 드래그 가능하게 만듦
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse,
      constraint: {
        stiffness: 0.5, // 값이 낮을수록 body가 마우스를 느슨하게(출렁이며) 따라옴
        render: {
          visible: false, // 마우스-body를 잇는 constraint 선은 화면에 그리지 않음
        },
      },
    });

    // 땅과벽
    const ground = Bodies.rectangle(
      (window.innerWidth / 2), window.innerHeight, window.innerWidth, 400, { render: { fillStyle: 'transparent' }, isStatic: true });
    const wallLeft = Bodies.rectangle(-80, window.innerHeight / 2, 160, window.innerHeight, { isStatic: true });
    const wallRight = Bodies.rectangle(window.innerWidth + 80, window.innerHeight / 2, 160, 1200, { isStatic: true });
    const roof = Bodies.rectangle(
      (window.innerWidth / 2) + 160, -80, window.innerWidth + 320, 160, { isStatic: true });

    // 가나디 1
    const ganadiImg = Bodies.rectangle(600, 100, 100, 100, {
      render: {
        sprite: {
          texture: ganadiImgSrc,
          xScale: 0.15,
          yScale: 0.14,
        },
      },
    });

    // 가나디 2
    const subGanadiImg = Bodies.rectangle(300, 100, 100, 100, {
      render: {
        sprite: {
          texture: ganadiImgSrc2,
          xScale: 1,
          yScale: 1,
        },
      },
    });

    // 축구공
    const ballImg = Bodies.rectangle(400, 100, 100, 100, {
      render: {
        sprite: {
          texture: ball,
          xScale: 0.1,
          yScale: 0.1,
        },
      },
    });

    // world는 engine이 계산할 body들의 집합. Composite.add로 등록해야 시뮬레이션에 포함됨
    // mouseConstraint도 world에 추가해야 등록된 body들이 실제로 마우스에 반응함
    Composite.add(engine.world, [ground, wallLeft, wallRight, roof, ballImg, ganadiImg, subGanadiImg, mouseConstraint]);

    // Runner: engine.update를 requestAnimationFrame 주기로 반복 호출해주는 루프 (Engine.run의 대체)
    const runner = Runner.create();
    Runner.run(runner, engine);
    // Render.run: render.canvas를 requestAnimationFrame 주기로 다시 그리는 루프 시작
    Render.run(render);

    // React StrictMode에서 effect가 두 번 실행/정리되므로, 언마운트 시 엔진/렌더러/canvas를 반드시 정리
    return () => {
      Render.stop(render);
      Runner.stop(runner);
      Composite.clear(engine.world, false);
      Engine.clear(engine);
      render.canvas.remove();
      render.textures = {};
    };
  }, []);

  return <div ref={sceneRef} className="scene" />;
}
