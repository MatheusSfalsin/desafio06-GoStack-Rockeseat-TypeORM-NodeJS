import AppError from '../errors/AppError';

import { getCustomRepository, getRepository } from 'typeorm';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Request {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const caregoryRepository = getRepository(Category);

    const { total } = await transactionsRepository.getBalance();

    if (type === 'outcome' && total < value) {
      throw new AppError('You do not have enough balance');
    }

    let transactionCaregory = await caregoryRepository.findOne({
      where: {
        title: category,
      },
    });

    if (!transactionCaregory) {
      transactionCaregory = caregoryRepository.create({
        title: category,
      });
      await caregoryRepository.save(transactionCaregory);
    }

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category: transactionCaregory,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
