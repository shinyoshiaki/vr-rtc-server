import WebRTC from "webrtc4me";
export declare function create(roomId: string, trickle: boolean): Promise<WebRTC>;
export declare function join(roomId: string, trickle: boolean): Promise<WebRTC>;
