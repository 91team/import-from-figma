import { Color } from 'figma-js';
import { Config } from '../config';
declare type ColorData = {
    name: string;
    color: Color;
    opacity: number;
};
declare function writeColors(colors: ColorData[], config: Config): Promise<void>;
export { writeColors };
