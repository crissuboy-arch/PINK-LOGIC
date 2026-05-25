import { motion } from 'framer-motion';

const LoadingScreen = () => {
  return (
    <div className="loading-screen">
      <motion.div 
        className="loading-logo-wrap"
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.8, 1, 0.8],
          boxShadow: [
            "0 0 20px rgba(255, 45, 141, 0.2)",
            "0 0 40px rgba(255, 45, 141, 0.5)",
            "0 0 20px rgba(255, 45, 141, 0.2)"
          ]
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <img src="/icon.png" alt="Loading..." className="loading-icon" />
      </motion.div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Carregando...
      </motion.p>

      <style>{`
        .loading-screen {
          position: fixed;
          inset: 0;
          background: #050508;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1.5rem;
          z-index: 9999;
        }

        .loading-logo-wrap {
          width: 80px;
          height: 80px;
          background: #000;
          border-radius: 20px;
          padding: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255, 45, 141, 0.2);
        }

        .loading-icon {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .loading-screen p {
          color: var(--text-secondary);
          font-size: 0.9rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
