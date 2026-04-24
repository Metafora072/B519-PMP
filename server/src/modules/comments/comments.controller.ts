import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";

import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { CurrentUserPayload } from "../../common/types/current-user.type";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CreateCommentDto } from "./dto/create-comment.dto";
import { UpdateCommentDto } from "./dto/update-comment.dto";
import { CommentsService } from "./comments.service";

@UseGuards(JwtAuthGuard)
@Controller()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get("tasks/:id/comments")
  listTaskComments(@Param("id") id: string, @CurrentUser() currentUser: CurrentUserPayload) {
    return this.commentsService.listTaskComments(id, currentUser.id);
  }

  @Post("tasks/:id/comments")
  createTaskComment(
    @Param("id") id: string,
    @CurrentUser() currentUser: CurrentUserPayload,
    @Body() dto: CreateCommentDto,
  ) {
    return this.commentsService.createTaskComment(id, currentUser.id, dto);
  }

  @Patch("comments/:id")
  updateComment(
    @Param("id") id: string,
    @CurrentUser() currentUser: CurrentUserPayload,
    @Body() dto: UpdateCommentDto,
  ) {
    return this.commentsService.updateComment(id, currentUser.id, dto);
  }

  @Delete("comments/:id")
  deleteComment(@Param("id") id: string, @CurrentUser() currentUser: CurrentUserPayload) {
    return this.commentsService.deleteComment(id, currentUser.id);
  }
}
