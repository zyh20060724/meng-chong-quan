import { useRef, useState, useEffect, useCallback } from 'react';

import type { NestLayout, PetType, PetInteraction } from '../types';

import { FURNITURE_SHOP } from '../constants';

import {

  PET_FEED_OPTIONS, PET_PLAY_OPTIONS, getDressReaction, getInteractionDuration,

} from '../constants/petInteractions';

import PetAvatar from './PetAvatar';

import './PetNest.css';



interface PetNestProps {

  layout: NestLayout;

  furniture: string[];

  petType: PetType;

  petName: string;

  outfit: string | null;

  interaction: PetInteraction;

  onLayoutChange: (layout: NestLayout) => void;

  onStoreFurniture: (furnitureId: string) => void;

  onPlaceFurniture: (furnitureId: string) => void;

}



type DragTarget = { type: 'pet' } | { type: 'furniture'; id: string };



function clamp(v: number, min: number, max: number) {

  return Math.min(max, Math.max(min, v));

}



function pickWanderTarget() {

  return {

    x: 12 + Math.random() * 72,

    y: 42 + Math.random() * 38,

  };

}



function getInteractionKey(interaction: PetInteraction): string | null {

  if (!interaction) return null;

  if (interaction.kind === 'feed') return `feed-${interaction.foodId}`;

  if (interaction.kind === 'play') return `play-${interaction.gameId}`;

  return `dress-${interaction.action}`;

}



function getReactionText(interaction: PetInteraction): string {

  if (!interaction) return '';

  if (interaction.kind === 'feed') {

    return PET_FEED_OPTIONS.find(f => f.id === interaction.foodId)?.reaction ?? '好吃好吃~';

  }

  if (interaction.kind === 'play') {

    return PET_PLAY_OPTIONS.find(g => g.id === interaction.gameId)?.reaction ?? '好开心！';

  }

  return getDressReaction(interaction.action, interaction.name).reaction;

}



function getExtraParticles(interaction: PetInteraction): string[] {

  if (!interaction) return [];

  if (interaction.kind === 'feed') {

    const map: Record<string, string[]> = {

      bone: ['💨', '✨'],

      carrot: ['🌿', '💚'],

      apple: ['💖', '😊'],

      fish: ['💫', '🐾'],

      cookie: ['🍪', '✨', '⭐'],

    };

    return map[interaction.foodId] ?? ['✨'];

  }

  if (interaction.kind === 'play') {

    const map: Record<string, string[]> = {

      ball: ['⭐', '💨'],

      yoyo: ['💫', '🌀'],

      sing: ['🎶', '♪', '♫', '🎤'],

    };

    return map[interaction.gameId] ?? ['✨'];

  }

  const map: Record<string, string[]> = {

    equip: ['✨', '💖', '⭐'],

    buy: ['🎁', '✨', '🎉'],

    unequip: ['~', '💨'],

  };

  return map[interaction.action] ?? ['✨'];

}



export default function PetNest({

  layout,

  furniture,

  petType,

  petName,

  outfit,

  interaction,

  onLayoutChange,

  onStoreFurniture,

  onPlaceFurniture,

}: PetNestProps) {

  const sceneRef = useRef<HTMLDivElement>(null);

  const [localLayout, setLocalLayout] = useState(layout);

  const [petPos, setPetPos] = useState({ x: layout.petX, y: layout.petY });

  const [isWalking, setIsWalking] = useState(false);

  const [facing, setFacing] = useState<'left' | 'right'>('right');

  const [dragging, setDragging] = useState<DragTarget | null>(null);

  const [selectedFurniture, setSelectedFurniture] = useState<string | null>(null);



  const draggingRef = useRef<DragTarget | null>(null);

  const movedRef = useRef(false);

  const startPosRef = useRef({ x: 0, y: 0 });

  const latestLayoutRef = useRef(localLayout);

  const petPosRef = useRef(petPos);

  const wanderTargetRef = useRef(pickWanderTarget());

  const wanderFrameRef = useRef<number | null>(null);

  const pauseWanderUntilRef = useRef(0);



  const interactionKey = getInteractionKey(interaction);



  useEffect(() => {

    latestLayoutRef.current = localLayout;

  }, [localLayout]);



  useEffect(() => {

    petPosRef.current = petPos;

  }, [petPos]);



  useEffect(() => {

    if (!draggingRef.current) {

      setLocalLayout(layout);

      setPetPos({ x: layout.petX, y: layout.petY });

      petPosRef.current = { x: layout.petX, y: layout.petY };

    }

  }, [layout]);



  useEffect(() => {

    if (interaction) {

      pauseWanderUntilRef.current = Date.now() + getInteractionDuration(interaction) + 200;

      setIsWalking(false);

    }

  }, [interaction]);



  useEffect(() => {

    const wander = () => {

      if (draggingRef.current || Date.now() < pauseWanderUntilRef.current) {

        wanderFrameRef.current = requestAnimationFrame(wander);

        return;

      }



      const pos = petPosRef.current;

      const target = wanderTargetRef.current;

      const dx = target.x - pos.x;

      const dy = target.y - pos.y;

      const dist = Math.hypot(dx, dy);



      if (dist < 1.5) {

        wanderTargetRef.current = pickWanderTarget();

        pauseWanderUntilRef.current = Date.now() + 600 + Math.random() * 1400;

        setIsWalking(false);

      } else {

        const speed = 0.045 + Math.random() * 0.02;

        const next = {

          x: pos.x + dx * speed,

          y: pos.y + dy * speed,

        };

        petPosRef.current = next;

        setPetPos(next);

        setIsWalking(true);

        if (Math.abs(dx) > 0.3) setFacing(dx > 0 ? 'right' : 'left');

      }



      wanderFrameRef.current = requestAnimationFrame(wander);

    };



    wanderFrameRef.current = requestAnimationFrame(wander);

    return () => {

      if (wanderFrameRef.current !== null) cancelAnimationFrame(wanderFrameRef.current);

    };

  }, []);



  const getPercentFromEvent = useCallback((clientX: number, clientY: number) => {

    const rect = sceneRef.current?.getBoundingClientRect();

    if (!rect) return { x: 50, y: 50 };

    return {

      x: clamp(((clientX - rect.left) / rect.width) * 100, 5, 92),

      y: clamp(((clientY - rect.top) / rect.height) * 100, 8, 88),

    };

  }, []);



  const applyDragPosition = useCallback((target: DragTarget, x: number, y: number, base: NestLayout) => {

    if (target.type === 'pet') {

      return { ...base, petX: x, petY: y };

    }

    const item = base.items[target.id];

    if (!item) return base;

    return {

      ...base,

      items: {

        ...base.items,

        [target.id]: { ...item, x, y, placed: true },

      },

    };

  }, []);



  const finishDrag = useCallback(() => {

    const final = latestLayoutRef.current;

    onLayoutChange(final);

    setPetPos({ x: final.petX, y: final.petY });

    petPosRef.current = { x: final.petX, y: final.petY };

    wanderTargetRef.current = pickWanderTarget();

    pauseWanderUntilRef.current = Date.now() + 800;

    draggingRef.current = null;

    setDragging(null);

    setIsWalking(false);

  }, [onLayoutChange]);



  const handlePointerMove = useCallback((e: PointerEvent) => {

    const target = draggingRef.current;

    if (!target) return;



    const dx = e.clientX - startPosRef.current.x;

    const dy = e.clientY - startPosRef.current.y;

    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) movedRef.current = true;



    const { x, y } = getPercentFromEvent(e.clientX, e.clientY);



    if (target.type === 'pet') {

      setPetPos({ x, y });

      petPosRef.current = { x, y };

      setLocalLayout(prev => {

        const next = { ...prev, petX: x, petY: y };

        latestLayoutRef.current = next;

        return next;

      });

    } else {

      setLocalLayout(prev => {

        const next = applyDragPosition(target, x, y, prev);

        latestLayoutRef.current = next;

        return next;

      });

    }

  }, [applyDragPosition, getPercentFromEvent]);



  const handlePointerUp = useCallback(() => {

    window.removeEventListener('pointermove', handlePointerMove);

    window.removeEventListener('pointerup', handlePointerUp);

    window.removeEventListener('pointercancel', handlePointerUp);

    if (draggingRef.current) finishDrag();

  }, [finishDrag, handlePointerMove]);



  const startDrag = (target: DragTarget, e: React.PointerEvent) => {

    e.preventDefault();

    e.stopPropagation();

    movedRef.current = false;

    startPosRef.current = { x: e.clientX, y: e.clientY };

    draggingRef.current = target;

    setDragging(target);

    setIsWalking(false);

    if (target.type === 'furniture') setSelectedFurniture(target.id);



    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    window.addEventListener('pointerup', handlePointerUp);

    window.addEventListener('pointercancel', handlePointerUp);

  };



  const handleFurnitureClick = (id: string) => {

    if (movedRef.current) return;

    setSelectedFurniture(prev => (prev === id ? null : id));

  };



  const placedFurniture = furniture.filter(id => localLayout.items[id]?.placed !== false);

  const storedFurniture = furniture.filter(id => localLayout.items[id]?.placed === false);



  const posStyle = (x: number, y: number): React.CSSProperties =>

    ({ '--nest-x': x, '--nest-y': y }) as React.CSSProperties;



  const mainFxEmoji = interaction

    ? interaction.kind === 'dress' ? interaction.emoji : interaction.emoji

    : null;



  const particles = interaction ? getExtraParticles(interaction) : [];



  return (

    <div className="pet-nest">

      <div className="pet-nest__hint">宠物会在小窝里闲逛 · 也可拖动宠物和家具摆放</div>

      <div

        ref={sceneRef}

        className={`pet-nest__scene${interactionKey ? ` pet-nest__scene--${interactionKey}` : ''}${dragging ? ' pet-nest__scene--dragging' : ''}`}

      >

        <div className="pet-nest__sky" />

        <div className="pet-nest__floor" />



        {placedFurniture.map(id => {

          const item = FURNITURE_SHOP.find(f => f.id === id);

          const pos = localLayout.items[id];

          if (!item || !pos) return null;

          const isDraggingItem = dragging?.type === 'furniture' && dragging.id === id;

          return (

            <div

              key={id}

              className={`pet-nest__furniture pet-nest__draggable${selectedFurniture === id ? ' pet-nest__furniture--selected' : ''}${isDraggingItem ? ' pet-nest__draggable--active' : ''}`}

              style={posStyle(pos.x, pos.y)}

              onPointerDown={e => startDrag({ type: 'furniture', id }, e)}

              onClick={() => handleFurnitureClick(id)}

            >

              <span className="pet-nest__furniture-emoji">{item.emoji}</span>

              {selectedFurniture === id && !dragging && (

                <button

                  className="pet-nest__store-btn"

                  onPointerDown={e => e.stopPropagation()}

                  onClick={e => {

                    e.stopPropagation();

                    onStoreFurniture(id);

                    setSelectedFurniture(null);

                  }}

                >

                  收回

                </button>

              )}

            </div>

          );

        })}



        <div

          className={[

            'pet-nest__pet pet-nest__draggable',

            dragging?.type === 'pet' ? 'pet-nest__draggable--active' : '',

            isWalking ? 'pet-nest__pet--walking' : '',

            facing === 'left' ? 'pet-nest__pet--face-left' : '',

            interactionKey ? `pet-nest__pet--${interactionKey}` : '',

          ].filter(Boolean).join(' ')}

          style={posStyle(petPos.x, petPos.y)}

          onPointerDown={e => startDrag({ type: 'pet' }, e)}

        >

          <PetAvatar petType={petType} size="lg" outfit={outfit} variant="flat" facing={facing} />

          <span className="pet-nest__pet-name">{petName}</span>



          {interaction && (

            <div className="pet-nest__bubble">{getReactionText(interaction)}</div>

          )}



          {mainFxEmoji && (

            <span className={`pet-nest__fx pet-nest__fx--main pet-nest__fx--${interaction?.kind}`}>

              {mainFxEmoji}

            </span>

          )}



          {particles.map((p, i) => (

            <span

              key={`${interactionKey}-p-${i}`}

              className={`pet-nest__particle pet-nest__particle--${i}`}

            >

              {p}

            </span>

          ))}

        </div>

      </div>



      {storedFurniture.length > 0 && (

        <div className="pet-nest__storage sketch-box">

          <span className="pet-nest__storage-label">仓库</span>

          <div className="pet-nest__storage-items">

            {storedFurniture.map(id => {

              const item = FURNITURE_SHOP.find(f => f.id === id);

              if (!item) return null;

              return (

                <button

                  key={id}

                  className="pet-nest__storage-item"

                  title={`摆放 ${item.name}`}

                  onClick={() => onPlaceFurniture(id)}

                >

                  {item.emoji}

                  <span>{item.name}</span>

                </button>

              );

            })}

          </div>

        </div>

      )}

    </div>

  );

}


