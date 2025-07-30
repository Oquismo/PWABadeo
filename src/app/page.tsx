// 1. Añade esta directiva en la primera línea
'use client';

import HeroSection from "@/components/home/HeroSection";
import StatsSection from "@/components/home/StatsSection";
import PillarsSection from "@/components/home/PillarsSection";
import { Fab } from "@mui/material";
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';

export default function Home() {
  return (
    <>
      <HeroSection />
      <StatsSection />
      <PillarsSection />

      <Fab 
        color="secondary"
        aria-label="solicitar información"
        sx={{
          position: 'fixed',
          bottom: (theme) => `calc(56px + ${theme.spacing(2)})`,
          right: (theme) => theme.spacing(2),
        }}
      >
        <QuestionAnswerIcon />
      </Fab>
    </>
  );
}