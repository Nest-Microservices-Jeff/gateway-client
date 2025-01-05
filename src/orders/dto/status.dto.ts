import { IsEnum, IsNotEmpty } from 'class-validator';
import { OrderStatus, OrderStatusList } from '../../common/enum/order.enum';

export class StatusDto {
  @IsEnum(OrderStatusList, {
    message: `Valid status are ${OrderStatusList}`,
  })
  @IsNotEmpty()
  status: OrderStatus;
}
