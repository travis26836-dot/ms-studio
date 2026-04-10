  // Layer operations
  const bringForward = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (active) {
      canvas.bringObjectForward(active);
      canvas.renderAll();
    }
  }, []);

  const sendBackward = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (active) {
      canvas.sendObjectBackwards(active);
      canvas.renderAll();
    }
  }, []);

  const bringToFront = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (active) {
      canvas.bringObjectToFront(active);
      canvas.renderAll();
    }
  }, []);

  const sendToBack = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (active) {
      canvas.sendObjectToBack(active);
      canvas.renderAll();
    }
  }, []);

  // Group / ungroup
  const groupSelected = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const activeObj = canvas.getActiveObject();
    if (activeObj && activeObj.type === "activeSelection") {
      const sel = activeObj as fabric.ActiveSelection;
      const objects = sel.getObjects();
      canvas.discardActiveObject();
      const group = new fabric.Group(objects);
      objects.forEach((o) => canvas.remove(o));
      canvas.add(group);
      canvas.setActiveObject(group);
      canvas.renderAll();
    }
  }, []);

  const ungroupSelected = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (active && active.type === "group") {
      const group = active as fabric.Group;
      const items = group.getObjects();
      canvas.remove(group);
      items.forEach((item) => canvas.add(item));
      canvas.renderAll();
    }
  }, []);

  // Lock/unlock
  const toggleLock = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (active) {
      const isLocked = !active.lockMovementX;
      active.set({
        lockMovementX: isLocked,
        lockMovementY: isLocked,
        lockRotation: isLocked,
        lockScalingX: isLocked,
        lockScalingY: isLocked,
        hasControls: !isLocked,
        selectable: true,
      });
      canvas.renderAll();
    }
  }, []);

  // Alignment
  const alignObjects = useCallback((alignment: string) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (!active) return;

    switch (alignment) {
      case "left":
        active.set({ left: 0 });
        break;
      case "center":
        active.set({ left: width / 2 - (active.width || 0) * (active.scaleX || 1) / 2 });
        break;
      case "right":
        active.set({ left: width - (active.width || 0) * (active.scaleX || 1) });
        break;
      case "top":
        active.set({ top: 0 });
        break;
      case "middle":
        active.set({ top: height / 2 - (active.height || 0) * (active.scaleY || 1) / 2 });
        break;
      case "bottom":
        active.set({ top: height - (active.height || 0) * (active.scaleY || 1) });
        break;
    }
    active.setCoords();
    canvas.renderAll();
  }, [width, height]);

  // Update object properties
  const updateActiveObject = useCallback((props: Record<string, unknown>) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (active) {
      active.set(props);
      canvas.renderAll();
    }
  }, []);

  // Set canvas background
  const setBackground = useCallback((color: string) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    canvas.backgroundColor = color;
    canvas.renderAll();
  }, []);

  // Export canvas
  const exportCanvas = useCallback((format: "png" | "jpg" | "json", quality = 1) => {
    const canvas = fabricRef.current;
    if (!canvas) return "";

    // Reset zoom for export
    const currentZoom = canvas.getZoom();
    canvas.setZoom(1);
    canvas.setDimensions({ width, height });

    let result: string;
    if (format === "json") {
      result = JSON.stringify(canvas.toJSON());
    } else {
      result = canvas.toDataURL({
        format: format === "jpg" ? "jpeg" : "png",
        quality,
        multiplier: 1,
      });
    }

    // Restore zoom
    canvas.setZoom(currentZoom);
    canvas.setDimensions({
      width: width * currentZoom,
      height: height * currentZoom,
    });

    return result;
  }, [width, height]);

  // Load from JSON
  const loadFromJSON = useCallback(async (json: string) => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    isUndoRedoRef.current = true;
    try {
      await canvas.loadFromJSON(JSON.parse(json));
      canvas.renderAll();
      saveHistory();
    } finally {
      isUndoRedoRef.current = false;
    }
  }, [saveHistory]);

  // Get all objects
  const getObjects = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return [];
    return canvas.getObjects();
  }, []);

  // Select object by index
  const selectObject = useCallback((index: number) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const objects = canvas.getObjects();
    if (index >= 0 && index < objects.length) {
      canvas.setActiveObject(objects[index]);
      canvas.renderAll();
    }
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (fabricRef.current) {
        fabricRef.current.dispose();
        fabricRef.current = null;
      }
    };
  }, []);

  return {
    fabricRef,
    editorState,
    initCanvas,
    addText,
    addHeading,
    addSubheading,
    addImage,
    addShape,
    deleteSelected,
    duplicateSelected,
    undo,
    redo,
    setZoom,
    bringForward,
    sendBackward,
    bringToFront,
    sendToBack,
    groupSelected,
    ungroupSelected,
    toggleLock,
    alignObjects,
    updateActiveObject,
    setBackground,
    exportCanvas,
    loadFromJSON,
    getObjects,
    selectObject,
    saveHistory,
  };
}
