import React, { useRef, useState } from "react";
import { IconButton, Box, ClickAwayListener, Tooltip } from "@mui/material";
import { SketchPicker } from "react-color";

export default function ColorPicker({ color, onChange, icon, tooltip, ariaLabel }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  return (
    <Box position="relative" display="inline-block">
      <Tooltip title={tooltip || ""} disableHoverListener={!tooltip}>
        <IconButton
          aria-label={ariaLabel || "Change Color"}
          size="small"
          onClick={() => setIsOpen(true)}
          sx={{ color: "#333" }}
        >
          {icon}
        </IconButton>
      </Tooltip>

      {isOpen && (
        <ClickAwayListener onClickAway={() => setIsOpen(false)}>
          <Box
            ref={ref}
            position="absolute"
            top={30}
            left={30}
            zIndex={10}
            sx={{ userSelect: "none" }}
          >
            <SketchPicker
              color={color}
              onChangeComplete={(c) => onChange(c.hex)}
            />
          </Box>
        </ClickAwayListener>
      )}
    </Box>
  );
}
