import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Inject,
  ParseUUIDPipe,
  Query,
  Patch,
} from '@nestjs/common';
import { NATS_SERVICE } from 'src/config';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { catchError, firstValueFrom } from 'rxjs';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderPaginationDto, StatusDto } from './dto';
import { PaginationDto } from 'src/common';

@Controller('orders')
export class OrdersController {
  constructor(
    @Inject(NATS_SERVICE) private readonly client: ClientProxy,
  ) {}

  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.client
      .send({ cmd: 'create_order' }, createOrderDto)
      .pipe(
        catchError((error) => {
          throw new RpcException(error);
        }),
      );
  }

  @Get()
  async findAll(@Query() paginationDto: OrderPaginationDto) {
    try {
      const orders = await firstValueFrom(
        this.client.send({ cmd: 'find_all_orders' }, paginationDto)
      )

      return orders;
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get('id/:id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.client.send({ cmd: 'find_one_order' }, { id }).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @Get(':status')
  findAllByStatus(
    @Param() statusDto: StatusDto,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.client
      .send(
        { cmd: 'find_all_orders' },
        {
          ...paginationDto,
          status: statusDto.status,
        },
      )
      .pipe(
        catchError((error) => {
          throw new RpcException(error);
        }),
      );
  }

  @Patch(':id')
  changeStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() statusDto: StatusDto,
  ) {
    return this.client
      .send(
        { cmd: 'change_order_status' },
        {
          id,
          status: statusDto.status,
        },
      )
      .pipe(
        catchError((error) => {
          throw new RpcException(error);
        }),
      );
  }
}
