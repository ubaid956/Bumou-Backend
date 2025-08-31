"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CallDto = exports.CallType = void 0;
var CallType;
(function (CallType) {
    CallType["OFFER"] = "offer";
    CallType["ANSWER"] = "answer";
    CallType["CANDIDATE"] = "candidate";
})(CallType || (exports.CallType = CallType = {}));
class CallDto {
    constructor() {
        this.isVideo = false;
    }
}
exports.CallDto = CallDto;
//# sourceMappingURL=call-payload.dto.js.map