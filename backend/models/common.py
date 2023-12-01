from enum import Enum


class Permission(Enum):
    NONE = 0
    READ = 1
    WRITE = 2

    def __lt__(self, other):
        return self.value < other.value
