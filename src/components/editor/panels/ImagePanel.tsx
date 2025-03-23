
  const handlePositionXChange = (value: number[]) => {
    console.log("Updating objectPositionX to:", value[0]);
    if (updateElementStyle) {
      updateElementStyle("objectPositionX", value[0]);
    }
  };

  const handlePositionYChange = (value: number[]) => {
    console.log("Updating objectPositionY to:", value[0]);
    if (updateElementStyle) {
      updateElementStyle("objectPositionY", value[0]);
    }
  };
