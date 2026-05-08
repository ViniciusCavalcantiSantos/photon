'use client'

import React, {useState} from "react";
import {
  Box,
  Dialog,
  DialogContent,
  IconButton,
  Stack,
  SxProps,
  Theme,
  Tooltip,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import FlipIcon from "@mui/icons-material/Flip";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import RotateLeftIcon from "@mui/icons-material/RotateLeft";
import RotateRightIcon from "@mui/icons-material/RotateRight";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import ZoomOutMapOutlinedIcon from "@mui/icons-material/ZoomOutMapOutlined";
import {TransformComponent, TransformWrapper} from "react-zoom-pan-pinch";

import {useT} from "@/i18n/client";

type ImagePreviewProps = {
  src: string;
  alt: string;
  title?: string;
  thumbnailSx?: SxProps<Theme>;
  imageSx?: SxProps<Theme>;
};

const toolbarButtonSx = {
  color: 'var(--st-text-sec)',
  borderRadius: '10px',
  '&:hover': {
    color: 'var(--st-text)',
    backgroundColor: 'var(--st-primary-light)',
  },
} as const;

export default function ImagePreview({src, alt, title, thumbnailSx, imageSx}: ImagePreviewProps) {
  const {t} = useT();
  const [open, setOpen] = useState(false);
  const [currentScale, setCurrentScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [flipX, setFlipX] = useState(false);
  const [flipY, setFlipY] = useState(false);

  const resetOrientation = () => {
    setRotation(0);
    setFlipX(false);
    setFlipY(false);
  };

  const close = () => {
    setOpen(false);
    setCurrentScale(1);
    resetOrientation();
  };

  return (
    <>
      <Box
        component="button"
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`${t('view')}: ${title ?? alt}`}
        sx={{
          width: '100%',
          height: '100%',
          display: 'block',
          p: 0,
          m: 0,
          border: 0,
          backgroundColor: 'transparent',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
          '&:hover .image-preview-overlay, &:focus-visible .image-preview-overlay': {
            opacity: 1,
          },
          '&:focus-visible': {
            outline: '2px solid var(--st-primary)',
            outlineOffset: '-2px',
          },
          ...thumbnailSx,
        }}
      >
        <Box
          component="img"
          src={src}
          alt={alt}
          sx={{
            width: '100%',
            height: '100%',
            display: 'block',
            objectFit: 'contain',
            backgroundColor: 'rgba(0, 0, 0, 0.34)',
            ...imageSx,
          }}
        />
        <Box
          className="image-preview-overlay"
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'grid',
            placeItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.28)',
            color: '#fff',
            opacity: 0,
            transition: 'opacity 0.18s ease',
            boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.18)',
            pointerEvents: 'none',
          }}
        >
          <ZoomOutMapOutlinedIcon sx={{fontSize: 28}}/>
        </Box>
      </Box>

      <Dialog
        open={open}
        onClose={close}
        fullScreen
        slotProps={{
          paper: {
            sx: {
              m: 0,
              width: '100vw',
              height: '100vh',
              maxWidth: 'none',
              maxHeight: 'none',
              borderRadius: 0,
              backgroundColor: 'transparent',
              border: 0,
              boxShadow: 'none',
              color: 'var(--st-text)',
              overflow: 'hidden',
            },
          },
          backdrop: {
            sx: {backgroundColor: 'rgba(0, 0, 0, 0.82)'},
          },
        }}
      >
        <DialogContent
          sx={{
            p: 0,
            width: '100vw',
            height: '100vh',
            position: 'relative',
            backgroundColor: 'transparent',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: {xs: 10, sm: 14},
              left: {xs: 10, sm: 14},
              right: {xs: 10, sm: 14},
              zIndex: 2,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 1,
              pointerEvents: 'none',
            }}
          >
            <Typography
              title={title ?? alt}
              sx={{
                maxWidth: {xs: 'calc(100% - 52px)', sm: 520},
                px: 1.35,
                py: 0.7,
                borderRadius: '12px',
                color: '#fff',
                backgroundColor: 'rgba(0, 0, 0, 0.42)',
                backdropFilter: 'blur(10px)',
                fontWeight: 700,
                fontSize: '0.86rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                pointerEvents: 'auto',
              }}
            >
              {title ?? alt}
            </Typography>
            <IconButton
              onClick={close}
              aria-label={t('close')}
              size="medium"
              sx={{
                ...toolbarButtonSx,
                ml: 'auto',
                color: '#fff',
                backgroundColor: 'rgba(0, 0, 0, 0.42)',
                backdropFilter: 'blur(10px)',
                pointerEvents: 'auto',
              }}
            >
              <CloseIcon fontSize="medium"/>
            </IconButton>
          </Box>

          <TransformWrapper
            initialScale={1}
            minScale={0.5}
            maxScale={14}
            centerOnInit
            centerZoomedOut
            limitToBounds
            smooth={false}
            wheel={{step: 0.08}}
            panning={{allowLeftClickPan: true, velocityDisabled: true}}
            doubleClick={{mode: 'toggle', step: 0.8}}
            onTransform={(_, state) => setCurrentScale(state.scale)}
          >
            {({zoomIn, zoomOut, resetTransform, centerView}) => (
              <Box
                sx={{
                  height: '100vh',
                  display: 'grid',
                  gridTemplateRows: '1fr auto',
                }}
              >
                <TransformComponent
                  wrapperStyle={{
                    width: '100%',
                    height: '100%',
                    minHeight: '0',
                    cursor: currentScale > 1 ? 'grab' : 'default',
                  }}
                  contentStyle={{
                    width: '100%',
                    height: '100%',
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  <Box
                    component="img"
                    src={src}
                    alt={alt}
                    draggable={false}
                    sx={{
                      maxWidth: 'calc(100vw - 48px)',
                      maxHeight: 'calc(100vh - 104px)',
                      width: 'auto',
                      height: 'auto',
                      objectFit: 'contain',
                      display: 'block',
                      userSelect: 'none',
                      pointerEvents: 'none',
                      transform: `rotate(${rotation}deg) scaleX(${flipX ? -1 : 1}) scaleY(${flipY ? -1 : 1})`,
                      transition: 'transform 0.16s ease',
                    }}
                  />
                </TransformComponent>

                <Box sx={{display: 'flex', justifyContent: 'center', px: 2, pb: {xs: 1.5, sm: 2}}}>
                  <Stack
                    direction="row"
                    sx={{
                      width: 'fit-content',
                      maxWidth: '100%',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 1,
                      px: 1.25,
                      py: 0.9,
                      borderRadius: '14px',
                      backgroundColor: 'rgba(11, 12, 16, 0.88)',
                      backdropFilter: 'blur(10px)',
                      overflowX: 'auto',
                    }}
                  >
                    <Tooltip title={t('zoom_out')} arrow>
                      <span>
                        <IconButton
                          onClick={() => zoomOut(0.35)}
                          disabled={currentScale <= 0.5}
                          aria-label={t('zoom_out')}
                          size="medium"
                          sx={toolbarButtonSx}
                        >
                          <ZoomOutIcon fontSize="medium"/>
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Typography sx={{width: 48, textAlign: 'center', color: 'var(--st-text-sec)', fontSize: '0.82rem', fontWeight: 700}}>
                      {Math.round(currentScale * 100)}%
                    </Typography>
                    <Tooltip title={t('zoom_in')} arrow>
                      <span>
                        <IconButton
                          onClick={() => zoomIn(0.35)}
                          disabled={currentScale >= 14}
                          aria-label={t('zoom_in')}
                          size="medium"
                          sx={toolbarButtonSx}
                        >
                          <ZoomInIcon fontSize="medium"/>
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title={t('rotate_left')} arrow>
                      <IconButton onClick={() => setRotation(value => value - 90)} aria-label={t('rotate_left')} size="medium" sx={toolbarButtonSx}>
                        <RotateLeftIcon fontSize="medium"/>
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={t('rotate_right')} arrow>
                      <IconButton onClick={() => setRotation(value => value + 90)} aria-label={t('rotate_right')} size="medium" sx={toolbarButtonSx}>
                        <RotateRightIcon fontSize="medium"/>
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={t('flip_horizontal')} arrow>
                      <IconButton onClick={() => setFlipX(value => !value)} aria-label={t('flip_horizontal')} size="medium" sx={toolbarButtonSx}>
                        <FlipIcon fontSize="medium"/>
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={t('flip_vertical')} arrow>
                      <IconButton onClick={() => setFlipY(value => !value)} aria-label={t('flip_vertical')} size="medium" sx={toolbarButtonSx}>
                        <SwapVertIcon fontSize="medium"/>
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={t('reset')} arrow>
                      <IconButton
                        onClick={() => {
                          resetOrientation();
                          setCurrentScale(1);
                          resetTransform(160);
                          centerView(1, 160);
                        }}
                        aria-label={t('reset')}
                        size="medium"
                        sx={toolbarButtonSx}
                      >
                        <RestartAltIcon fontSize="medium"/>
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Box>
              </Box>
            )}
          </TransformWrapper>
        </DialogContent>
      </Dialog>
    </>
  );
}
