import estadioArroyito from '../../assets/estadio-gigante-arroyito.png';
import bioceresArena from '../../assets/bioceres-arena.jpg';
import elCirculo from '../../assets/el-circulo.png';

export const SECTOR_LAYOUT_CONFIG: Record<string, Record<string, number>> = {
    'Estadio Gigante de Arroyito': { 'Tribuna Norte': 4, 'Tribuna Sur': 4 },
    'Bioceres Arena': { VIP: 10 },
    'El Circulo': { 'Sala Principal': 5, 'Tribuna Superior': 5 },
};

export const STADIUM_IMAGES: Record<string, string> = {
    'Estadio Gigante de Arroyito': estadioArroyito,
    'Bioceres Arena': bioceresArena,
    'El Circulo': elCirculo,
};
