export interface StartCallingToNewPeerDTO {
  roomId: string;
  newPeerId: string;
}

export interface ICECandidateDTO {
  roomId: string;
  label: string;
  candidate: string;
  peerTo: string;
}

export interface OfferDTO {
  type: string;
  sdp: unknown;
  roomId: string;
  peerFrom: string;
  peerTo: string;
}

export type AnswerDTO = OfferDTO;

export interface AnswerOfferProcessCompletionDTO {
  roomId: string;
  peerFrom: string;
  peerTo: string;
}
