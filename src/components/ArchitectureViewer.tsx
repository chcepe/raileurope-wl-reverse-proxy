"use client";

import Image from "next/image";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

export function ArchitectureViewer() {
  const [zoom, setZoom] = useState(1);
  const viewport = useRef<HTMLDivElement>(null);

  const zoomValue = useRef(1);
  const pendingScroll = useRef<{ left: number; top: number } | null>(null);
  const drag = useRef<{ x: number; y: number; left: number; top: number } | null>(null);

  const changeZoom = useCallback((requested: number, clientX?: number, clientY?: number) => {
    const element = viewport.current;
    if (!element) return;
    const next = Math.min(4, Math.max(1, requested));
    const previous = zoomValue.current;
    if (next === previous) return;
    const bounds = element.getBoundingClientRect();
    const x = clientX === undefined ? element.clientWidth / 2 : clientX - bounds.left;
    const y = clientY === undefined ? element.clientHeight / 2 : clientY - bounds.top;
    const ratio = next / previous;
    pendingScroll.current = {
      left: (element.scrollLeft + x) * ratio - x,
      top: (element.scrollTop + y) * ratio - y,
    };
    zoomValue.current = next;
    setZoom(next);
  }, []);

  useLayoutEffect(() => {
    if (pendingScroll.current && viewport.current) {
      viewport.current.scrollTo(pendingScroll.current);
      pendingScroll.current = null;
    }
  }, [zoom]);

  useEffect(() => {
    const element = viewport.current;
    if (!element) return;

    function handleWheel(event: WheelEvent) {
      // Trackpad pinch gestures are delivered as Ctrl+wheel in Chromium.
      // Leave ordinary two-finger scrolling available for panning.
      if (!event.ctrlKey) return;
      event.preventDefault();
      changeZoom(zoomValue.current * Math.exp(-event.deltaY * 0.01), event.clientX, event.clientY);
    }

    element.addEventListener("wheel", handleWheel, { passive: false });
    return () => element.removeEventListener("wheel", handleWheel);
  }, [changeZoom]);

  function resetZoom() {
    changeZoom(1);
    viewport.current?.scrollTo(0, 0);
  }

  return (
    <>
      <figure className="diagram-canvas">
        <div className="diagram-viewer">
        <div className="diagram-viewport" ref={viewport} tabIndex={0}
          onPointerDown={(event) => {
            if (event.button !== 0 || event.pointerType === "touch") return;
            const element = event.currentTarget;
            element.setPointerCapture(event.pointerId);
            drag.current = { x: event.clientX, y: event.clientY, left: element.scrollLeft, top: element.scrollTop };
            element.style.cursor = "grabbing";
          }}
          onPointerMove={(event) => {
            if (!drag.current) return;
            event.currentTarget.scrollTo(
              drag.current.left - (event.clientX - drag.current.x),
              drag.current.top - (event.clientY - drag.current.y),
            );
          }}
          onPointerUp={(event) => {
            drag.current = null;
            event.currentTarget.style.cursor = "";
            if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
          }}
          onLostPointerCapture={(event) => { drag.current = null; event.currentTarget.style.cursor = ""; }}
          role="region" aria-label="Architecture diagram. Pinch or Ctrl+scroll to zoom. Drag or scroll to pan.">
          <div className="diagram-stage" style={{ width: `${zoom * 100}%`, height: `${zoom * 100}%` }}>
            <Image src="/integration-diagram.svg"
              alt="Traveller requests reach Rail Europe’s routing layer. Existing pages are served by Rail Europe. Search, booking, and supporting requests pass through a reverse proxy and Omio Cloudflare to the Rail Europe whitelabel. The proxy rewrites response URLs and cookie domains to keep the journey under raileurope.com."
              fill className="architecture-image" unoptimized draggable={false} />
          </div>
        </div>
        <div className="diagram-slider" role="group" aria-label="Diagram zoom controls">
          <span>Zoom</span>
          <input type="range" min="100" max="400" step="1"
            value={Math.round(zoom * 100)}
            aria-label="Diagram zoom percentage"
            aria-valuetext={`${Math.round(zoom * 100)} percent`}
            onChange={(event) => changeZoom(Number(event.target.value) / 100)} />
          <span>{Math.round(zoom * 100)}%</span>
          <button type="button" onClick={resetZoom}>Reset</button>
        </div>
        </div>
        <figcaption>
          In this demo, the Vercel hostname represents raileurope.com. Rail Europe
          would implement the routing and proxy on its own hosting.
        </figcaption>
      </figure>
    </>
  );
}
