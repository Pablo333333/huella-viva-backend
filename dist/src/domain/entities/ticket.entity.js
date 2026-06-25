"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ticket = void 0;
class Ticket {
    id;
    title;
    description;
    latitude;
    longitude;
    workflowStateId;
    categoryId;
    userId;
    createdAt;
    updatedAt;
    categoryName;
    statusName;
    constructor(props) {
        Object.assign(this, props);
    }
}
exports.Ticket = Ticket;
//# sourceMappingURL=ticket.entity.js.map