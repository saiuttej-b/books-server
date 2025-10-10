import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ProjectPostDto, ProjectsGetDto } from '../dtos/projects.dto';
import { ProjectsMutationService } from '../services/projects-mutation.service';
import { ProjectsService } from '../services/projects.service';

@Controller('projects')
export class ProjectsController {
  constructor(
    private readonly mutationService: ProjectsMutationService,
    private readonly service: ProjectsService,
  ) {}

  @Post()
  addProject(@Body() body: ProjectPostDto) {
    return this.mutationService.addProject(body);
  }

  @Put(':id')
  updateProject(@Body() body: ProjectPostDto, @Param('id') id: string) {
    return this.mutationService.updateProject(body, id);
  }

  @Get()
  getProjects(@Query() query: ProjectsGetDto) {
    return this.service.getProjects(query);
  }

  @Get(':id')
  getProjectDetails(@Param('id') id: string) {
    return this.service.getProjectDetails(id);
  }
}
